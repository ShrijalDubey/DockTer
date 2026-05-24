# 🐳 DockTer — AI-Powered Dockerfile Generator & 1-Click Container Orchestrator

[![PyPI version](https://img.shields.io/pypi/v/dockter-agent.svg?color=blue&logo=pypi&logoColor=white)](https://pypi.org/project/dockter-agent/)
[![Docker Compose](https://img.shields.io/badge/docker-compose-blue.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/react-19.x-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.136.x-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Groq Engine](https://img.shields.io/badge/LLM-Groq--Llama3-orange.svg)](https://groq.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**DockTer** is a state-of-the-art developer tool suite that automatically analyzes local project structures, generates secure and optimized Docker configurations, and enables **one-click container compilation & runtime streaming** directly to your browser's console using a secure, zero-install local companion agent.

---

## 🚀 The DockTer Vision

Building production-ready container environments is typically a cycle of trial, error, and tedious boilerplate configuration. **DockTer** bridges this gap by introducing an **AI-driven, local-first bridge** that understands your stack, writes optimized configurations, and deploys them to your machine in seconds.

---

## 🏗️ Architecture Overview

```
                                +----------------------------+
                                |     Vite React Client      |  (Port 5173 / Deployed)
                                |   (generator dashboard)    |
                                +--------------+-------------+
                                               |
                      +------------------------+------------------------+
                      | Polls /health & triggers /deploy                | Calls generation APIs
                      v                                                 v
        +----------------------------+                    +----------------------------+
        |   dockter-agent Service    |  (Port 8001)       |    FastAPI Core Backend    |  (Port 8000 / Deployed)
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
               [Docker Daemon]
```

---

## 🌟 Premium Features

- **⚡ AI-Driven Codebase Scan**: Automatically detects languages (Python, Node, Go, Rust, Ruby, PHP, and more), backend frameworks, active database clients, caching stores (Redis), task queues (Celery), and proxy/web server demands (Nginx).
- **⚙️ Dynamic Tweak & Configure**: Fine-tune configurations directly from the sidebar: toggle developer hot-reloading, lock precise image version pins, select light-weight base image distributions (Alpine, Slim), or swap the deployment targets from Docker Compose to production-ready Kubernetes manifests.
- **🐳 One-Click Local Orchestration**: Orchestrate container clusters instantly from your web dashboard. The companion agent builds images, boots containers, and streams compiler logs directly into a live-updating web-based Build Console.
- **📦 Distributed PyPI Agent**: Secure, zero-install companion agent launched directly from the PyPI registry via `uvx` or `pipx`.
- **🔒 Enterprise Security Boundary**: Safe, sandbox-locked companion agent. The API runs strictly on `localhost` (`127.0.0.1`) and rejects requests from any origin other than trusted local development clients or authenticated domains.

---

## 📦 Zero-Install Quickstart (Local Development)

The easiest way to run DockTer locally is to start the companion agent directly from PyPI while running the development backend and client.

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
Start the secure companion uploader instantly from PyPI:
```bash
uvx --from dockter-agent dockter-agent start
# or alternatively
pipx run dockter-agent start
```
*The local companion agent is now online, secured behind local origins, and listening on **`http://127.0.0.1:8001`***

---

## 🚀 Deploying to Production

You can deploy the **Vite React Frontend** to Vercel and the **FastAPI Python Backend** to Render. The companion agent always remains running locally on the client's machine.

### 1. Frontend on Vercel
1. Link your GitHub repository in the **Vercel** dashboard.
2. Set the **Root Directory** to `client`.
3. Configure the following environment variable under settings:
   - **`VITE_API_URL`**: `https://your-backend-service.onrender.com/api` (The deployed backend URL, ending in `/api`).
4. Trigger the deployment.

### 2. Backend on Render
1. Create a new **Web Service** on **Render** and link your repository.
2. Set the **Root Directory** to `backend`.
3. Set the **Build Command** to `pip install -r requirements.txt` and the **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Configure the following environment variables:
   - **`FRONTEND_URL`**: `https://your-frontend-project.vercel.app` (The deployed Vercel URL).
   - **`GROQ_API_KEY`**: Your active Groq API Key.
   - **`GITHUB_CLIENT_ID`**: GitHub OAuth Application client ID.
   - **`GITHUB_CLIENT_SECRET`**: GitHub OAuth Application client secret.

---

## 🛡️ Enterprise Security Boundary

- **Origin Sandboxing**: The companion agent utilizes strict CORS headers, rejecting any incoming web triggers that do not originate from whitelisted domains:
  - Local Dev: `http://localhost:5173`
  - Production: `https://project-dockter.vercel.app`
- **Local-Only Interface**: Binds exclusively to the `127.0.0.1` loopback interface, ensuring it is unreachable from local area networks.
- **Sanitized Executions**: Container processes run securely in user-initiated terminal sessions, completely isolating system operations from external exploits.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
