# 🐳 DockTer — AI-Powered Dockerfile Generator & 1-Click Container Orchestrator

[![PyPI version](https://img.shields.io/pypi/v/dockter-agent.svg?color=blue&logo=pypi&logoColor=white)](https://pypi.org/project/dockter-agent/)
[![Docker Compose](https://img.shields.io/badge/docker-compose-blue.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/react-18.x-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.100.x-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Groq Engine](https://img.shields.io/badge/LLM-Groq--Llama3-orange.svg)](https://groq.com/)

**DockTer** is a state-of-the-art developer tool suite that automatically analyzes local project structures, generates secure and optimized Docker configurations, and enables **one-click container compilation & runtime streaming** directly to your browser's console using a secure, zero-install local companion agent.

---

## 🚀 The DockTer Vision

Building production-ready container ecosystems is usually a cycle of trial, error, and boilerplate configuration. **DockTer** bridges this gap by introducing an **AI-driven, local-first bridge** that understands your stack, writes optimized configurations, and deploys them to your machine in seconds.


---

## 🌟 Premium Features

- **⚡ AI-Driven Codebase Scan**: Automatically detects languages (Python, Node, Go, Rust, Ruby, PHP, and more), backend frameworks, active database clients, caching stores (Redis), task queues (Celery), and proxy/web server demands (Nginx).
- **⚙️ Dynamic Tweak & Configure**: Fine-tune configurations directly from the sidebar: toggle developer hot-reloading, lock precise image version pins, select light-weight base image distributions (Alpine, Slim), or swap the deployment targets from Docker Compose to production-ready Kubernetes manifests.
- **🐳 One-Click Local Orchestration**: Orchestrate container clusters instantly from your web dashboard. The companion agent builds images, boots containers, and streams compiler logs directly into a live-updating web-based Build Console.
- **📦 Distributed PyPI Agent**: Secure, zero-install companion agent launched directly from the PyPI registry via `uvx` or `pipx`.
- **🔒 Enterprise Security Boundary**: Safe, sandbox-locked companion agent. The API runs strictly on `localhost` (`127.0.0.1`) and rejects requests from any origin other than trusted local development clients or authenticated domains.

---

## 🏗️ Architecture Overview

```
                                +----------------------------+
                                |     Vite React Client      |  (Port 5173)
                                |   (generator dashboard)    |
                                +--------------+-------------+
                                               |
                      +------------------------+------------------------+
                      | Polls /health & triggers /deploy                | Calls generation APIs
                      v                                                 v
        +----------------------------+                    +----------------------------+
        |   dockter-agent Service    |  (Port 8001)       |    FastAPI Core Backend    |  (Port 8000)
        | (Secure PyPI local shell)  |                    | (LLM scan, DB, analyzer)  |
        +--------------+-------------+                    +--------------+-------------+
                       |                                                 |
                       | 1. Writes files locally                         | Queries Groq model
                       v                                                 v
               [Local Filesystem] <-------------------------------+  [Groq LLM Service]
                       |          2. Writes generated content
                       |
                       | 3. Runs 'docker compose up --build'
                       v
              [Docker Environment]
```

---

## 📦 Zero-Install Quickstart (Using PyPI & `uvx`)

The easiest way to run DockTer is to start the companion agent directly from PyPI while running the development backend and client.

### Step 1: Boot Up the FastAPI Core Backend (`localhost:8000`)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your environment variables inside a `.env` file:
   ```ini
   GROQ_API_KEY=gsk_your_actual_groq_api_key_here
   DATABASE_URL=sqlite:///dockergen.db
   FRONTEND_URL=http://localhost:5173
   ```
3. Install the backend server requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Step 2: Boot Up the Vite React Client (`localhost:5173`)
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install frontend modules:
   ```bash
   npm install
   ```
3. Start the Vite client:
   ```bash
   npm run dev
   ```

### Step 3: Run the PyPI Companion Agent (`localhost:8001`)
You do not need to clone the repository or manually configure local environments to run the agent. Simply start it instantly from PyPI:
```bash
uvx dockter-agent start
# or alternatively
pipx run dockter-agent start
```
*The local companion agent is now online, secured behind local origins, and listening on **`http://127.0.0.1:8001`***

---

## 🏃 Local Development Setup (Manual Setup)

If you are developing the companion agent and want to run it from a local cloned directory:

1. Navigate to the agent workspace:
   ```bash
   cd agent
   ```
2. Install the companion agent in editable development mode:
   ```bash
   pip install -e .
   ```
3. Start the agent:
   ```bash
   dockter-agent start
   ```

---

## 🚀 The 1-Click Orchestration Lifecycle

Once the frontend, backend, and PyPI agent are running:

1. Open your browser and navigate to the dashboard at **`http://localhost:5173`**.
2. Drop in a project zip file or input your repository path for scan.
3. Review your newly generated files (`Dockerfile`, `docker-compose.yml`, `nginx.conf`, or `k8s.yaml`).
4. Spot the **Local Orchestration** panel on the left sidebar:
   - When the agent is active, it glows with a green **`● Connected`** status.
5. Click **Deploy via Local Docker**:
   - The frontend routes files directly to your agent via a secure POST request.
   - The agent writes the generated cluster files directly into a new local directory named `dockter-{project_name}` in the folder where the agent was launched.
   - It invokes your local Docker engine (`docker compose up --build`).
   - Compilation and runtime output stream directly to the browser **Build Console** in real-time!

---

## 🛡️ Enterprise Security Boundary

- **Origin Sandboxing**: The companion agent utilizes strict CORS headers, rejecting any incoming web triggers that do not originate from `http://localhost:5173` or `https://dockter.dev`.
- **Local-Only Interface**: Binds exclusively to the `127.0.0.1` loopback interface, ensuring it is unreachable from local area networks.
- **Sanitized Executions**: Container processes run securely in user-initiated terminal sessions, completely isolating system operations from external exploits.

---

