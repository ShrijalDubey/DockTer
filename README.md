# 🐳 DockTer — AI Dockerfile Generator & 1-Click Local Container Orchestrator

DockTer is an AI-powered developer tool suite that automatically analyzes your local codebases, generates complete, optimized Docker configurations, fine-tunes them based on developer preferences, and enables **one-click local Docker container builds & log streaming** directly from your web dashboard's sidebar!

---

## 🏗️ Architecture Overview

The DockTer platform is modularly divided into three core layers:

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
       |   (Local container shell)  |                    | (LLM scan, DB, analyzer)  |
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

1. **`client`**: A high-fidelity Vite + React frontend dashboard featuring glassmorphic controls and Monaco code editors (**`http://localhost:5173`**).
2. **`backend`**: A FastAPI core backend service that parses codebase manifests, prunes tokens under rate limits, queries the Groq LLM API, and manages project history via SQLite (**`http://localhost:8000`**).
3. **`agent`**: The `dockter-agent` Python package that acts as a secure local companion, writing generated configuration files locally and streaming active container builds (**`http://localhost:8001`**).

---

## ⚙️ Prerequisites

Before launching the project, ensure you have the following installed on your machine:
* **Python 3.9+** (Python 3.13.7 recommended)
* **Node.js 18+** (Node.js 20+ recommended)
* **Docker Desktop** (with standard Docker Compose activated)
* **Groq API Key** (obtainable from the [Groq Console](https://console.groq.com/))

---

## 🏃 Step-by-Step Setup & Launch Guide

Follow these sequential steps to boot up the entire development ecosystem.

### Step 1: Boot Up the FastAPI Core Backend (`localhost:8000`)

The core backend manages project databases, performs codebase static analysis, and interfaces with the LLM.

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create your `.env` configuration file:
   Create a file named `.env` in the `backend/` directory and configure your Groq credentials:
   ```ini
   GROQ_API_KEY=gsk_your_actual_groq_api_key_here
   DATABASE_URL=sqlite:///dockergen.db
   FRONTEND_URL=http://localhost:5173
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The backend is now live and waiting for client requests at **`http://127.0.0.1:8000`***

---

### Step 2: Boot Up the Vite React Client (`localhost:5173`)

The web dashboard displays the visual workspace interface.

1. Open a new terminal window and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite client development server:
   ```bash
   npm run dev
   ```
   *The frontend dashboard is now online and accessible at **`http://localhost:5173`***

---

### Step 3: Launch the Companion Agent (`localhost:8001`)

The companion agent runs locally in the background, receiving commands from the client browser to orchestrate containers.

1. Open a third terminal window and navigate to the agent directory:
   ```bash
   cd agent
   ```
2. Install the agent package locally in editable development mode:
   ```bash
   pip install -e .
   ```
3. Boot up the local agent server:
   ```bash
   dockter-agent start
   ```
   *(Alternative: Run directly via uvx without manual installation)*:
   ```bash
   uvx --from dockter-agent dockter-agent start
   ```
   *The local agent is now online, secured behind localhost boundaries, and listening on **`http://127.0.0.1:8001`***

---

## 🚀 Deploying & Running Locally (1-Click Orchestration)

Once all three components are running successfully, trigger a container deployment as follows:

1. Open your browser and navigate to the frontend dashboard: **`http://localhost:5173`**.
2. Upload your source files or input your repository path for analysis.
3. Once the files are analyzed and Docker configurations are generated:
   * Look at the **Local Orchestration** card on the bottom-left sidebar.
   * If `dockter-agent` is active, it will show a green **`● Connected`** status badge.
4. Click **Deploy via Local Docker**.
5. The system will perform the following actions:
   * The React app sends the generated file contents to the local agent (`/deploy`).
   * The local agent creates a folder called `dockter-{project_name}` in the folder where the agent was launched.
   * It writes all generated files (`Dockerfile`, `docker-compose.yml`, etc.) into that folder.
   * It kicks off `docker compose up --build` to compile your image and boot the containers.
   * The agent streams the live terminal compilation output (npm installs, build bundles, and runtime container prints) directly to your browser's **Build Console** console in real-time!

---

## 🔒 Security Measures

* **CORS Limits**: The local companion agent is hard-locked to accept cross-origin requests *only* from the trusted local Vite dev client (`http://localhost:5173`) and the official DockTer domain (`https://dockter.dev`). Third-party websites are strictly blocked.
* **Local Binding**: The agent binds strictly to `127.0.0.1` (localhost), ensuring the API is never exposed to external local network requests.
* **ASCII Prints**: Fully optimized console log outputs to guarantee 100% crash-free printing in traditional Windows command-line and PowerShell encodings.
