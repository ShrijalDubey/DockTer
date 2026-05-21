import os
import subprocess
import asyncio
from typing import Dict, List
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(
    title="DockTer Local Agent",
    description="Secure FastAPI local companion agent for DockTer"
)

# Secure CORS configuration: only allow requests from trusted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dockter.dev", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DeployRequest(BaseModel):
    files: Dict[str, str]
    project_name: str

def _get_compose_cmd(cwd: str) -> List[str]:
    """Helper to detect whether 'docker compose' or 'docker-compose' is available."""
    try:
        # Test 'docker compose version'
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
        # Test 'docker-compose version'
        subprocess.run(
            ["docker-compose", "version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )
        return ["docker-compose"]
    except Exception:
        pass

    # Fallback to modern standard
    return ["docker", "compose"]

def _run_docker_compose(workspace_path: str):
    """Orchestrates docker compose up --build in the background, saving all compiler and runtime logs to build.log."""
    print(f"[DockTer] Starting Docker container orchestration in {workspace_path}...")
    
    # 1. Process Recycling: Terminate any old orchestrator process group running for this project
    pid_file = os.path.join(workspace_path, "orchestrator.pid")
    if os.path.exists(pid_file):
        try:
            with open(pid_file, "r") as f:
                old_pid = int(f.read().strip())
            print(f"[DockTer] Recycling old orchestrator process with PID {old_pid}...")
            if os.name == 'nt':
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(old_pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                import signal
                os.kill(old_pid, signal.SIGTERM)
        except Exception as e:
            print(f"[DockTer] Old process already dead or couldn't be terminated: {e}")

    cmd = _get_compose_cmd(workspace_path)
    # We run 'up --build' (without -d) so we capture BOTH compiler logs and runtime logs!
    full_cmd = cmd + ["up", "--build"]
    log_file_path = os.path.join(workspace_path, "build.log")
    
    try:
        # Delete old build log to start fresh
        if os.path.exists(log_file_path):
            try:
                os.remove(log_file_path)
            except Exception:
                pass
                
        with open(log_file_path, "w", encoding="utf-8") as log_file:
            process = subprocess.Popen(
                full_cmd,
                cwd=workspace_path,
                stdout=log_file,
                stderr=log_file,
                shell=True if os.name == 'nt' else False
            )
            # Save the new process PID so we can recycle it on future builds
            with open(pid_file, "w") as f:
                f.write(str(process.pid))
                
            process.wait()
            print("[DockTer] Docker Compose orchestration process exited.")
    except Exception as e:
        with open(log_file_path, "a", encoding="utf-8") as log_file:
            log_file.write(f"\n[Error] Exception running Docker Compose: {e}\n")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "DockTer FastAPI agent is active and running."}

@app.post("/deploy")
async def deploy_project(payload: DeployRequest, background_tasks: BackgroundTasks):
    # Formulate workspace directory name in current working directory
    safe_name = payload.project_name.lower().replace(" ", "-").strip()
    safe_name = "".join(c for c in safe_name if c.isalnum() or c == "-")
    workspace_name = f"dockter-{safe_name}"
    
    workspace_path = os.path.join(os.getcwd(), workspace_name)

    try:
        # 1. Write the generated files to the filesystem
        os.makedirs(workspace_path, exist_ok=True)
        for filename, content in payload.files.items():
            file_path = os.path.join(workspace_path, filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)

        # 2. Trigger the container build task in the background
        background_tasks.add_task(_run_docker_compose, workspace_path)

        return {
            "status": "building",
            "workspace": workspace_path,
            "message": "Local deployment directory created. Starting Docker Compose build..."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write workspace: {str(e)}")

@app.get("/logs/{project_name}")
async def stream_logs(project_name: str):
    """Streams live compilation and container logs using Server-Sent Events (SSE) from build.log."""
    safe_name = project_name.lower().replace(" ", "-").strip()
    safe_name = "".join(c for c in safe_name if c.isalnum() or c == "-")
    workspace_name = f"dockter-{safe_name}"
    workspace_path = os.path.join(os.getcwd(), workspace_name)

    if not os.path.exists(workspace_path):
        raise HTTPException(status_code=404, detail="Project workspace not found.")

    async def log_generator():
        log_file_path = os.path.join(workspace_path, "build.log")
        
        # 1. Wait for build.log to be created by the background orchestrator task
        for _ in range(30):  # Wait up to 15 seconds
            if os.path.exists(log_file_path):
                break
            await asyncio.sleep(0.5)
            
        if not os.path.exists(log_file_path):
            yield "data: [DockTer] Waiting for compiler agent to start...\n\n"
            return
            
        try:
            # 2. Open and tail build.log asynchronously
            with open(log_file_path, "r", encoding="utf-8", errors="ignore") as f:
                while True:
                    line = f.readline()
                    if not line:
                        # Wait briefly for more output to be written by the background subprocess
                        await asyncio.sleep(0.1)
                        continue
                    yield f"data: {line.rstrip()}\n\n"
        except Exception as e:
            yield f"data: [Error] Connection to build logs failed: {str(e)}\n\n"

    return StreamingResponse(log_generator(), media_type="text/event-stream")
