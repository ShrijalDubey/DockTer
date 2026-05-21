# 🐳 DockTer Companion Agent

A secure, lightweight local companion agent built with **FastAPI** to enable one-click Docker container orchestration and live log streaming directly from your DockTer client.

## 🚀 Features

- **One-Click Local Deployment**: Extracts generated files, constructs an isolated workspace, and spins up your services using `docker compose up --build -d`.
- **Live Logs Console**: Streams real-time container log stdout/stderr via Server-Sent Events (SSE).
- **Subprocess Command Compatibility**: Dynamically resolves modern `docker compose` or legacy standalone `docker-compose` setups.
- **Strict Security Architecture**: Implements locked-down CORS configurations to prevent unauthorized web contexts from executing arbitrary commands or accessing the Docker daemon.

## 🛠️ Installation

You can install the companion agent locally in editable mode for development, or install it directly using standard Python packaging:

```bash
# Clone the repository and navigate to the agent folder
cd agent

# Install in editable mode
pip install -e .
```

Alternatively, you can run it directly using `uvx` or `pipx` (recommended):

```bash
uvx --from dockter-agent dockter-agent start
```

## 💻 CLI Usage

Once installed, the CLI tool exposes a standard set of commands:

```bash
# Start the companion agent on the default port (8001)
dockter-agent start

# Start the companion agent on a custom port
dockter-agent start --port 8002
```

## 🔒 Security Architecture

To protect your system, the agent enforces the following constraints:
1. **Confined CORS Limits**: Cross-Origin Resource Sharing (CORS) is explicitly restricted to local origins (`http://localhost:5173`) and the official production domain (`https://dockter.dev`). External, untrusted sites are completely blocked from calling the API.
2. **Local Loopback Only**: The Uvicorn server is bound strictly to `127.0.0.1` (localhost), preventing remote machines on the local network or public internet from accessing the endpoints.
3. **Workspace Isolation**: Projects are built and orchestrated inside designated, isolated subdirectories (`dockter-{project_name}`) in the directory where the agent is launched.
