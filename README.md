<p align="center">
  <img src="client/src/assets/logo.png" alt="DockTer Logo" width="120" />
</p>

<h1 align="center">DockTer</h1>

<p align="center">
  <strong>Automatic Docker configuration generation & local container orchestration.</strong>
</p>

<p align="center">
  <a href="https://project-dockter.vercel.app">Live Demo</a> · <a href="#getting-started">Getting Started</a> · <a href="#cli-companion-agent">CLI Agent</a> · <a href="#tech-stack">Tech Stack</a>
</p>

---

## Overview

DockTer is a full-stack application that automatically scans project dependencies, generates production-ready Docker configurations (Dockerfiles, docker-compose files, CI workflows, nginx configs), and optionally orchestrates containers locally — all in one click.

Point it at a **GitHub repository URL** or upload a **ZIP archive** of your source code, and DockTer will:

1. **Analyze** your project's languages, frameworks, and dependencies
2. **Generate** optimized, secure Docker configurations using AI (Groq LLM)
3. **Preview** every generated file in a built-in code editor
4. **Configure & Tweak** settings like base image type, hot-reload, version pinning, and orchestration target
5. **Deploy locally** with a single click via the companion CLI agent

---

## Screenshots

### Landing Page
The landing page introduces DockTer with a quick-install command and links to the web dashboard and CLI setup guide.

![Landing Page](screenshots/Screenshot%202026-05-24%20170923.png)

### Dashboard
The main dashboard where users paste a GitHub URL or upload a ZIP archive to generate Docker configurations. Authenticated users see a personalized welcome greeting.

![Dashboard](screenshots/Screenshot%202026-05-24%20171007.png)

### Results & Code Editor
After generation, DockTer displays all generated files in a split-panel view — file tree on the left, full code editor (Monaco) on the right. Users can browse files, copy content, configure preferences, and download the entire config bundle.

![Results View](screenshots/Screenshot%202026-05-24%20171042.png)

### CLI Setup Guide
A step-by-step interactive guide walks users through installing and connecting the local companion agent for 1-click container orchestration.

![CLI Setup](screenshots/Screenshot%202026-05-24%20170947.png)

---

## Features

| Feature | Description |
|---|---|
| **GitHub URL Analysis** | Paste any public GitHub repo URL to auto-detect languages, frameworks, and dependencies |
| **ZIP Upload** | Drag-and-drop or browse to upload a source archive for analysis |
| **AI-Powered Generation** | Generates Dockerfiles, docker-compose.yml, .dockerignore, nginx configs, and CI/CD workflows using Groq LLM |
| **Built-in Code Editor** | Monaco-powered editor with syntax highlighting for previewing every generated file |
| **Configure & Tweak** | Adjust base image type, enable dev hot-reloading, pin exact versions, switch orchestration targets |
| **Regeneration** | Re-generate files on-the-fly with updated preferences without re-analyzing |
| **Tech Stack Detection** | Automatically identifies and displays detected languages, frameworks, and databases |
| **GitHub OAuth** | Authenticate with GitHub to save and manage project history |
| **Project History** | Sidebar with recent projects — click to reload any previous generation |
| **Download Config** | Download all generated files as a bundled config package |
| **Local Orchestration** | One-click deploy via the companion CLI agent — writes files and runs `docker-compose up` locally |
| **Live Deploy Logs** | Real-time streaming logs from the local agent via Server-Sent Events (SSE) |
| **Responsive Design** | Fully responsive mobile layout with tab-based panel switching |
| **CI/CD Generation** | Auto-generates `.github/workflows/ci.yml` for GitHub Actions |

---

## Tech Stack

### Frontend
- **React 19** with Vite
- **CSS Modules** with glassmorphism design system
- **Monaco Editor** for code preview
- **GitHub OAuth** for authentication

### Backend
- **Python 3.11** with **FastAPI**
- **SQLAlchemy** ORM with **SQLite** (dev) / **PostgreSQL** (production)
- **Groq AI** (LLM) for intelligent Docker config generation
- **GitPython** for repository cloning & analysis
- **Alembic** for database migrations
- **JWT** authentication with `python-jose`

### CLI Companion Agent
- **Python** package published to PyPI as `dockter-agent`
- **FastAPI** local server on port `8001`
- Writes generated files to disk and interfaces with the local Docker engine
- Installable via `pip`, `uvx`, or `pipx`

### Infrastructure
- **Docker** & **Docker Compose** for containerized deployment
- **Nginx** as production reverse proxy for the frontend
- **PostgreSQL 16** (Alpine) as the production database
- **Vercel** for frontend hosting

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React + Vite)                 │
│                                                         │
│  Landing Page ──► Dashboard ──► Results & Code Editor    │
│       │              │               │                  │
│       │         GitHub URL /     Configure &             │
│       │          ZIP Upload      Regenerate              │
│       │              │               │                  │
│  CLI Tutorial    Analyze API     Generate API            │
└──────┬──────────────┬───────────────┬───────────────────┘
       │              │               │
       ▼              ▼               ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI + SQLAlchemy)              │
│                                                         │
│  /api/auth/*      GitHub OAuth flow & JWT tokens        │
│  /api/analyze     Clone repo / extract ZIP → analyze    │
│  /api/generate    AI-powered Dockerfile generation      │
│  /api/projects    CRUD for saved project history        │
│                                                         │
│  Services: Analyzer → Generator (Groq LLM) → Response  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  PostgreSQL 16  │
              │    (Database)   │
              └─────────────────┘

┌─────────────────────────────────────────────────────────┐
│           Local Companion Agent (dockter-agent)         │
│                                                         │
│  Runs on localhost:8001                                 │
│  POST /deploy   → Writes files & runs docker-compose   │
│  GET  /logs/:id → Streams live container logs via SSE   │
│  GET  /health   → Agent connectivity check              │
└─────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **Python** ≥ 3.11
- **Docker** & **Docker Compose** (for containerized deployment)
- A **Groq API key** ([get one here](https://console.groq.com))
- A **GitHub OAuth App** (for authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/ShrijalDubey/DockTer.git
cd DockTer
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`.

### 4. Docker Compose (Full Stack)

To run everything in containers:

```bash
docker compose up --build
```

This starts:
| Service | Port | Description |
|---|---|---|
| `client` | `3000` | React frontend (Nginx) |
| `backend` | `8000` | FastAPI backend |
| `db` | — | PostgreSQL 16 database |
| `agent` | — | Companion agent |

---

## CLI Companion Agent

The companion agent enables **1-click local container orchestration** directly from the DockTer web dashboard.

### Install

```bash
# pip
pip install dockter-agent && dockter-agent start

# uvx (instant, no install)
uvx dockter-agent start

# pipx (isolated environment)
pipx run dockter-agent start
```

### How It Works

1. The agent starts a local FastAPI server on `http://localhost:8001`
2. The web dashboard detects the agent via `/health` endpoint polling
3. Click **"Deploy Locally"** in the dashboard to write files and run `docker-compose up`
4. Live container logs stream back to the browser via SSE

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `GROQ_API_KEY` | API key for Groq LLM service | — |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID | — |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret | — |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `DATABASE_URL` | Database connection string | `sqlite:///dockergen.db` |
| `JWT_SECRET_KEY` | Secret key for JWT token signing | `supersecretkey_dockergen_dev` |

---

## Project Structure

```
DockTer/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Layout, Sidebar
│   │   ├── context/            # AuthContext
│   │   ├── features/
│   │   │   ├── auth/           # AuthModal
│   │   │   └── generator/      # Core feature
│   │   │       ├── components/ # UploadSection, ResultsSection, etc.
│   │   │       └── generator.module.css
│   │   ├── hooks/              # useGenerator
│   │   ├── pages/              # Dashboard, LandingPage, CliTutorial
│   │   ├── services/           # API client
│   │   └── utils/              # File helpers
│   └── package.json
│
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/routes/         # auth, analyze, generate, projects
│   │   ├── core/               # config, database, security
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # analyzer, generator, prompts, constants
│   │   └── main.py             # FastAPI entrypoint
│   ├── requirements.txt
│   └── .env
│
├── agent/                      # CLI companion agent (PyPI package)
│   ├── dockter_agent/          # Agent source code
│   └── pyproject.toml
│
├── screenshots/                # Application screenshots
├── Dockerfile                  # Backend container
├── Dockerfile.frontend         # Frontend container (multi-stage + Nginx)
├── docker-compose.yml          # Full-stack orchestration
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/github/login` | Initiate GitHub OAuth flow |
| `GET` | `/api/auth/github/callback` | GitHub OAuth callback |
| `GET` | `/api/auth/me` | Get authenticated user info |
| `POST` | `/api/analyze` | Analyze a GitHub repo or ZIP archive |
| `POST` | `/api/generate/{project_id}` | Generate/regenerate Docker configs |
| `GET` | `/api/projects` | List user's saved projects |
| `DELETE` | `/api/projects/{id}` | Delete a saved project |

---

## License

This project is licensed under a customized MIT License. You are welcome to submit pull requests and request features, but public forks, modifications, and distribution of derivative works require prior express permission from the author. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/ShrijalDubey">Shrijal Dubey</a>
</p>
