import os
import sys
import argparse
import zipfile
import tempfile
import subprocess
import uvicorn
import requests
from dockter_agent.main import app

# ========================================================
# 🎨 PREMIUM TERMINAL STYLE PALETTE & HELPERS
# ========================================================
C_CYAN = "\033[38;5;39m"       # Vibrant Blue/Cyan
C_MAGENTA = "\033[38;5;170m"   # Bright Magenta/Purple
C_GREEN = "\033[38;5;78m"      # Fresh Green
C_YELLOW = "\033[38;5;220m"    # Gold Yellow
C_RED = "\033[38;5;196m"       # Deep Red
C_GRAY = "\033[38;5;244m"      # Dim Gray
C_BOLD = "\033[1m"
C_RESET = "\033[0m"

def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        encoding = sys.stdout.encoding or 'utf-8'
        try:
            print(msg.encode(encoding, errors='replace').decode(encoding))
        except Exception:
            # Absolute fallback
            print(msg.encode('ascii', errors='ignore').decode('ascii'))

def print_logo():
    safe_print(f"\n{C_CYAN}{C_BOLD}[DockTer CLI] — AI Container Orchestration Engine{C_RESET}")
    safe_print(f"{C_GRAY}========================================================{C_RESET}")

def print_info(msg):
    safe_print(f"  {C_CYAN}[i]{C_RESET} {msg}")

def print_success(msg):
    safe_print(f"  {C_GREEN}[+]{C_RESET} {msg}")

def print_warning(msg):
    safe_print(f"  {C_YELLOW}[!]{C_RESET} {msg}")

def print_error(msg):
    safe_print(f"  {C_RED}[x]{C_RESET} {msg}")

def print_step(step, total, msg):
    safe_print(f"\n{C_GRAY}[{step}/{total}]{C_RESET} {C_BOLD}{C_MAGENTA}>>{C_RESET} {C_BOLD}{msg}{C_RESET}")

def should_ignore(path, cwd):
    rel_path = os.path.relpath(path, cwd)
    parts = rel_path.split(os.sep)
    ignore_names = {
        ".git", "node_modules", "venv", ".venv", "dist", "build", 
        "__pycache__", ".idea", ".vscode", "dockter-ljlostandfound", 
        "dockter-opeer", "dockter-realtime", ".gemini", "brain"
    }
    # Skip if any path segment matches
    for part in parts:
        if part in ignore_names:
            return True
        if part.endswith(".zip"):
            return True
        if part.startswith(".env"):
            return True
    return False

def zip_project(cwd):
    print_info("Compressing active working directory...")
    temp_zip = tempfile.NamedTemporaryFile(suffix=".zip", delete=False)
    temp_zip_name = temp_zip.name
    temp_zip.close()
    
    file_count = 0
    try:
        with zipfile.ZipFile(temp_zip_name, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for root, dirs, files in os.walk(cwd):
                # Prune directory search in-place to avoid deep traversal into ignored folders
                dirs[:] = [d for d in dirs if not should_ignore(os.path.join(root, d), cwd)]
                for file in files:
                    file_path = os.path.join(root, file)
                    if not should_ignore(file_path, cwd):
                        arcname = os.path.relpath(file_path, cwd)
                        zip_file.write(file_path, arcname)
                        file_count += 1
        print_success(f"Successfully packaged {C_BOLD}{file_count}{C_RESET} project files.")
        return temp_zip_name
    except Exception as e:
        if os.path.exists(temp_zip_name):
            os.unlink(temp_zip_name)
        raise RuntimeError(f"Zipping failed: {e}")

def _get_compose_cmd():
    """Helper to detect whether 'docker compose' or 'docker-compose' is available."""
    try:
        subprocess.run(
            ["docker", "compose", "version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )
        return ["docker", "compose"]
    except Exception:
        pass

    try:
        subprocess.run(
            ["docker-compose", "version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )
        return ["docker-compose"]
    except Exception:
        pass

    return ["docker", "compose"]

def run_scan(args):
    cwd = os.getcwd()
    print_logo()
    print_info(f"Target Directory: {C_BOLD}{cwd}{C_RESET}")
    
    backend_url = args.backend_url.rstrip('/')
    
    zip_path = None
    try:
        print_step(1, 4, "Packaging & Compressing project codebase")
        zip_path = zip_project(cwd)
        
        # 1. Post to analyze endpoint
        print_step(2, 4, f"Uploading package for static analysis")
        print_info(f"Target Service: {C_GRAY}{backend_url}/api/analyze/direct{C_RESET}")
        with open(zip_path, 'rb') as f:
            files = {'file': (os.path.basename(zip_path), f, 'application/zip')}
            response = requests.post(f"{backend_url}/api/analyze/direct", files=files, timeout=60)
            
        if response.status_code != 200:
            print_error(f"Codebase analysis failed (HTTP {response.status_code}): {response.text}")
            return
            
        context = response.json()
        print_success("Codebase static analysis completed successfully!")
        
        # 2. Prepare preferences and post to generate endpoint
        base_img = "default"
        if args.alpine:
            base_img = "alpine"
        elif args.slim:
            base_img = "slim"
            
        preferences = {
            "base_image_type": base_img,
            "enable_hot_reload": args.hot_reload,
            "pin_versions": args.pin_versions,
            "orchestration_target": args.target
        }
        
        payload = {
            "context": context,
            "preferences": preferences
        }
        
        print_step(3, 4, "Requesting custom configuration synthesis from AI Core")
        print_info(f"Target Service: {C_GRAY}{backend_url}/api/generate/direct{C_RESET}")
        gen_response = requests.post(f"{backend_url}/api/generate/direct", json=payload, timeout=60)
        
        if gen_response.status_code != 200:
            print_error(f"Configuration generation failed (HTTP {gen_response.status_code}): {gen_response.text}")
            return
            
        generated_files = gen_response.json()
        print_success("Configurations generated successfully!")
        
        # 3. Write files to working directory
        print_step(4, 4, "Writing newly synthesized configurations to filesystem")
        
        for rel_filename, content in generated_files.items():
            file_dest = os.path.abspath(os.path.join(cwd, rel_filename))
            parent_dir = os.path.dirname(file_dest)
            if parent_dir:
                os.makedirs(parent_dir, exist_ok=True)
                
            with open(file_dest, "w", encoding="utf-8") as out_f:
                out_f.write(content)
            
            safe_print(f"    {C_GRAY}+ Created:{C_RESET} {C_BOLD}{rel_filename}{C_RESET}")
            
        safe_print(f"\n{C_GREEN}{C_BOLD}========================================================{C_RESET}")
        safe_print(f"{C_GREEN}{C_BOLD}   SUCCESS: Files written directly to your project!{C_RESET}")
        safe_print(f"{C_GREEN}{C_BOLD}========================================================{C_RESET}\n")
        safe_print(f"{C_BOLD}Next steps:{C_RESET}")
        safe_print(f"  {C_CYAN}->{C_RESET} Run {C_BOLD}dockter-agent deploy{C_RESET} to orchestrate your application.")
        safe_print(f"  {C_CYAN}->{C_RESET} Inspect your new configuration files locally.\n")
        
    except Exception as e:
        print_error(f"Scanner execution failed: {e}")
    finally:
        if zip_path and os.path.exists(zip_path):
            try:
                os.unlink(zip_path)
            except Exception:
                pass

def run_deploy(args):
    cwd = os.getcwd()
    print_logo()
    print_info(f"Active Deployment Target: {C_BOLD}{args.target.upper()}{C_RESET}")
    print_info(f"Context Directory: {C_BOLD}{cwd}{C_RESET}")
    
    if args.target == "compose":
        compose_file = os.path.join(cwd, "docker-compose.yml")
        if not os.path.exists(compose_file):
            compose_file = os.path.join(cwd, "docker-compose.yaml")
            
        if not os.path.exists(compose_file):
            print_error("No docker-compose.yml file found in the active workspace.")
            print_warning("Please run 'dockter-agent scan' first to generate configurations.")
            return
            
        cmd = _get_compose_cmd()
        full_cmd = cmd + ["up", "--build"]
        print_info(f"Executing command: {C_BOLD}{' '.join(full_cmd)}{C_RESET}")
        print_info("Connecting to log stream. Press Ctrl+C to stop...\n")
        
        try:
            subprocess.run(full_cmd, cwd=cwd, check=True)
        except KeyboardInterrupt:
            print_warning("Orchestration interrupted by user.")
        except subprocess.CalledProcessError as e:
            print_error(f"Docker Compose orchestration exited with code {e.returncode}")
        except Exception as e:
            print_error(f"Execution failed: {e}")
            
    elif args.target == "kubernetes":
        k8s_dir = os.path.join(cwd, "k8s")
        if not os.path.exists(k8s_dir):
            print_error("No 'k8s' directory found in the active workspace.")
            print_warning("Please run 'dockter-agent scan --target kubernetes' first.")
            return
            
        # Verify kubectl availability
        try:
            subprocess.run(["kubectl", "version", "--client"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        except Exception:
            print_error("'kubectl' client is not installed or not in system PATH.")
            print_warning("Please install kubectl or ensure it is running.")
            return
            
        # Verify cluster connection
        try:
            print_info("Verifying Kubernetes cluster connection...")
            subprocess.run(["kubectl", "cluster-info"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True, timeout=5)
            print_success("Connected to Kubernetes cluster successfully.")
        except Exception:
            print_error("Could not connect to Kubernetes cluster.")
            print_warning("Please check your cluster context using 'kubectl config get-contexts'.")
            return
            
        full_cmd = ["kubectl", "apply", "-f", "k8s/"]
        print_info(f"Executing command: {C_BOLD}{' '.join(full_cmd)}{C_RESET}")
        
        try:
            subprocess.run(full_cmd, cwd=cwd, check=True)
            safe_print(f"\n{C_GREEN}{C_BOLD}========================================================{C_RESET}")
            safe_print(f"{C_GREEN}{C_BOLD}   SUCCESS: Kubernetes resources deployed successfully!{C_RESET}")
            safe_print(f"{C_GREEN}{C_BOLD}========================================================{C_RESET}\n")
            safe_print(f"{C_BOLD}Useful commands:{C_RESET}")
            safe_print(f"  {C_CYAN}->{C_RESET} {C_BOLD}kubectl get pods{C_RESET}")
            safe_print(f"  {C_CYAN}->{C_RESET} {C_BOLD}kubectl get services{C_RESET}\n")
        except subprocess.CalledProcessError as e:
            print_error(f"Kubernetes deployment exited with code {e.returncode}")
        except Exception as e:
            print_error(f"Execution failed: {e}")

def main():
    parser = argparse.ArgumentParser(
        description="DockTer Local Agent -- Secure CLI & Web Companion"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # 1. 'start' command to boot up uvicorn
    start_parser = subparsers.add_parser(
        "start",
        help="Boot up the secure local companion agent server"
    )
    start_parser.add_argument(
        "--port",
        type=int,
        default=8001,
        help="Host port to run the agent server (default: 8001)"
    )

    # 2. 'scan' command for local scanning and writing configurations
    scan_parser = subparsers.add_parser(
        "scan",
        help="Scan active codebase, analyze via backend, and generate configurations directly"
    )
    scan_parser.add_argument(
        "--target",
        choices=["compose", "kubernetes"],
        default="compose",
        help="Orchestration target platform (default: compose)"
    )
    scan_parser.add_argument(
        "--alpine",
        action="store_true",
        help="Generate lightweight Alpine-based container configurations"
    )
    scan_parser.add_argument(
        "--slim",
        action="store_true",
        help="Generate slim-based container configurations"
    )
    scan_parser.add_argument(
        "--pin-versions",
        action="store_true",
        help="Pin major/minor software versions to prevent breaking upgrades"
    )
    scan_parser.add_argument(
        "--hot-reload",
        action="store_true",
        help="Configure containers with hot reloading for active local development"
    )
    scan_parser.add_argument(
        "--backend-url",
        type=str,
        default=os.getenv("DOCKTER_BACKEND_URL", "https://dockter-backend.onrender.com"),
        help="Full URL of the backend API service (defaults to production, override with DOCKTER_BACKEND_URL)"
    )

    # 3. 'deploy' command to orchestrate containers/k8s
    deploy_parser = subparsers.add_parser(
        "deploy",
        help="Orchestrate generated configurations locally using Docker or Kubernetes"
    )
    deploy_parser.add_argument(
        "--target",
        choices=["compose", "kubernetes"],
        default="compose",
        help="Deployment target engine (default: compose)"
    )

    args = parser.parse_args()

    if args.command == "start":
        print_logo()
        print_success("Local Companion Agent Initiated")
        print_info("CORS Sandbox security bound to trusted origins.")
        print_info(f"Starting server on {C_BOLD}http://127.0.0.1:{args.port}{C_RESET} ...\n")
        uvicorn.run(app, host="127.0.0.1", port=args.port, log_level="info")
        
    elif args.command == "scan":
        run_scan(args)
        
    elif args.command == "deploy":
        run_deploy(args)

if __name__ == "__main__":
    main()
