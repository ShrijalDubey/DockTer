import os
import sys
import argparse
import zipfile
import tempfile
import subprocess
import uvicorn
import requests
from dockter_agent.main import app

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
    return False

def zip_project(cwd):
    print("  -> Compressing active working directory...")
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
        print(f"  -> Successfully packaged {file_count} project files.")
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
    print("\n========================================================")
    print("      DockTer CLI Engine -- Codebase Scanner & Generator")
    print("========================================================\n")
    print(f"[!] Target Directory: {cwd}")
    
    backend_url = args.backend_url.rstrip('/')
    
    zip_path = None
    try:
        zip_path = zip_project(cwd)
        
        # 1. Post to analyze endpoint
        print(f"[!] Uploading package to analyze API ({backend_url}/api/analyze/direct) ...")
        with open(zip_path, 'rb') as f:
            files = {'file': (os.path.basename(zip_path), f, 'application/zip')}
            response = requests.post(f"{backend_url}/api/analyze/direct", files=files, timeout=60)
            
        if response.status_code != 200:
            print(f"[Error] Codebase analysis failed (HTTP {response.status_code}): {response.text}")
            return
            
        context = response.json()
        print("[+] Codebase static analysis completed successfully!")
        
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
        
        print(f"[!] Requesting configuration generation from API ({backend_url}/api/generate/direct) ...")
        gen_response = requests.post(f"{backend_url}/api/generate/direct", json=payload, timeout=60)
        
        if gen_response.status_code != 200:
            print(f"[Error] Configuration generation failed (HTTP {gen_response.status_code}): {gen_response.text}")
            return
            
        generated_files = gen_response.json()
        print("[+] Configurations generated successfully!\n")
        
        # 3. Write files to working directory
        print("--------------------------------------------------------")
        print(" WRITING FILES TO FILESYSTEM")
        print("--------------------------------------------------------")
        
        for rel_filename, content in generated_files.items():
            file_dest = os.path.abspath(os.path.join(cwd, rel_filename))
            parent_dir = os.path.dirname(file_dest)
            if parent_dir:
                os.makedirs(parent_dir, exist_ok=True)
                
            with open(file_dest, "w", encoding="utf-8") as out_f:
                out_f.write(content)
            
            print(f"  + Created: {rel_filename}")
            
        print("\n========================================================")
        print(" SUCCESS: Files written directly to your project!")
        print("========================================================\n")
        print("Next steps:")
        print("  * Run 'dockter-agent deploy' to orchestrate your application.")
        print("  * Inspect your new configuration files locally.")
        
    except Exception as e:
        print(f"[Error] Scanner execution failed: {e}")
    finally:
        if zip_path and os.path.exists(zip_path):
            try:
                os.unlink(zip_path)
            except Exception:
                pass

def run_deploy(args):
    cwd = os.getcwd()
    print("\n========================================================")
    print("      DockTer CLI Engine -- Local Container Orchestrator")
    print("========================================================\n")
    print(f"[!] Active Deployment Target: {args.target.upper()}")
    print(f"[!] Context Directory: {cwd}\n")
    
    if args.target == "compose":
        compose_file = os.path.join(cwd, "docker-compose.yml")
        if not os.path.exists(compose_file):
            compose_file = os.path.join(cwd, "docker-compose.yaml")
            
        if not os.path.exists(compose_file):
            print("[Error] No docker-compose.yml file found in the active workspace.")
            print("        Please run 'dockter-agent scan' first to generate configurations.")
            return
            
        cmd = _get_compose_cmd()
        full_cmd = cmd + ["up", "--build"]
        print(f"[!] Running command: {' '.join(full_cmd)}")
        print("[!] Connecting to logs stream. Press Ctrl+C to stop...\n")
        
        try:
            subprocess.run(full_cmd, cwd=cwd, check=True)
        except KeyboardInterrupt:
            print("\n[!] Orchestration interrupted by user.")
        except subprocess.CalledProcessError as e:
            print(f"\n[Error] Docker Compose orchestration exited with code {e.returncode}")
        except Exception as e:
            print(f"\n[Error] Execution failed: {e}")
            
    elif args.target == "kubernetes":
        k8s_dir = os.path.join(cwd, "k8s")
        if not os.path.exists(k8s_dir):
            print("[Error] No 'k8s' directory found in the active workspace.")
            print("        Please run 'dockter-agent scan --target kubernetes' first.")
            return
            
        # Verify kubectl availability
        try:
            subprocess.run(["kubectl", "version", "--client"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        except Exception:
            print("[Error] 'kubectl' client is not installed or not in system PATH.")
            print("        Please install kubectl or ensure it is running.")
            return
            
        # Verify cluster connection
        try:
            print("[!] Verifying Kubernetes cluster connection...")
            subprocess.run(["kubectl", "cluster-info"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True, timeout=5)
            print("[+] Connected to Kubernetes cluster successfully.")
        except Exception:
            print("[Error] Could not connect to Kubernetes cluster.")
            print("        Please check your cluster context using 'kubectl config get-contexts'.")
            return
            
        full_cmd = ["kubectl", "apply", "-f", "k8s/"]
        print(f"[!] Running command: {' '.join(full_cmd)}")
        
        try:
            subprocess.run(full_cmd, cwd=cwd, check=True)
            print("\n========================================================")
            print(" SUCCESS: Kubernetes resources deployed successfully!")
            print("========================================================\n")
            print("Useful commands:")
            print("  * kubectl get pods")
            print("  * kubectl get services")
        except subprocess.CalledProcessError as e:
            print(f"\n[Error] Kubernetes deployment exited with code {e.returncode}")
        except Exception as e:
            print(f"\n[Error] Execution failed: {e}")

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
        default="http://localhost:8000",
        help="Full URL of the backend API service (default: http://localhost:8000)"
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
        print("[DockTer] Local Agent Command Line Interface")
        print("[Secure] CORS protection enabled for trusted client origins.")
        print(f"[Server] Starting agent server on http://127.0.0.1:{args.port} ...\n")
        uvicorn.run(app, host="127.0.0.1", port=args.port, log_level="info")
        
    elif args.command == "scan":
        run_scan(args)
        
    elif args.command == "deploy":
        run_deploy(args)

if __name__ == "__main__":
    main()
