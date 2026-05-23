import os
import re
import json
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

from app.services.prompts import STACK_GUIDES
def _infer_runner(context: dict) -> str:
    return "ubuntu-latest"


def _collect_stack_guides(context: dict) -> str:
    guides = []
    if context.get("is_flutter"):
        guides.append(STACK_GUIDES["flutter"])
    if context.get("is_react_native"):
        guides.append(STACK_GUIDES["react_native"])
    if context.get("is_spring_boot") or "Spring Boot" in context.get("frameworks", []):
        guides.append(STACK_GUIDES["spring_boot"])
    if context.get("is_go"):
        guides.append(STACK_GUIDES["go"])
    if context.get("is_rust"):
        guides.append(STACK_GUIDES["rust"])
    if context.get("is_dotnet"):
        guides.append(STACK_GUIDES["dotnet"])
    if context.get("is_php"):
        guides.append(STACK_GUIDES["php"])
    if context.get("is_ruby"):
        guides.append(STACK_GUIDES["ruby"])
    if context.get("is_elixir"):
        guides.append(STACK_GUIDES["elixir"])
    if context.get("is_swift"):
        guides.append(STACK_GUIDES["swift"])
    return "\n".join(guides) if guides else ""


def _build_prompt(context: dict, preferences: dict = None) -> str:
    stack_specific = _collect_stack_guides(context)
    runner = _infer_runner(context)

    pref_instruction = ""
    is_k8s = False
    
    if preferences:
        pref_rules = []
        base_img = preferences.get("base_image_type", "default")
        if base_img == "alpine":
            pref_rules.append("- BASE IMAGE PREFERENCE: You MUST use Alpine-based lightweight base images (e.g. python:3.11-alpine, node:20-alpine) wherever possible.")
        elif base_img == "slim":
            pref_rules.append("- BASE IMAGE PREFERENCE: You MUST use slim-based lightweight base images (e.g. python:3.11-slim, node:20-slim) wherever possible.")
        
        if preferences.get("enable_hot_reload"):
            pref_rules.append("- DEVELOPMENT PREFERENCE: You MUST configure docker-compose for local development hot-reloading. Mount appropriate local host volumes, configure watch options, set environment variables (e.g. WATCHPACK_POLLING=true, FLASK_DEBUG=1, etc.), and ensure cache folders (like node_modules) are not overridden by local mounts.")
        
        if preferences.get("pin_versions"):
            pref_rules.append("- VERSIONING PREFERENCE: You MUST pin exact runtime and package versions in Dockerfiles and Compose configurations (e.g. use node:20.11.0-alpine instead of node:alpine; do not use 'latest' tags for database or service images; use specific versions like postgres:16.2-alpine, redis:7.2-alpine).")
            
        if preferences.get("orchestration_target") == "kubernetes":
            is_k8s = True
            pref_rules.append("- ORCHESTRATION PREFERENCE: In addition to standard Dockerfiles and Compose setups, you MUST generate production-ready Kubernetes (K8s) manifests under the 'k8s/' folder. Include Deployments, Services, ConfigMaps, and an Ingress specification. You MUST also modify the GitHub Actions CI/CD to support Kubernetes rolling deployment workflows.")
            
        if pref_rules:
            pref_instruction = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nUSER PREFERENCES (MUST follow above all else)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" + "\n".join(pref_rules) + "\n\n"

    k8s_manifest_rules = ""
    output_format_keys = """- "Dockerfile"                   (always)
- "Dockerfile.frontend"          (only if has_frontend=true and NOT mobile-only)
- "client/nginx.conf"            (only if has_frontend=true and NOT mobile-only)
- "Dockerfile.worker"            (only if has_celery=true)
- "docker-compose.yml"           (always)
- ".dockerignore"                (always)
- ".flake8"                      (only if Python is used in backend/worker/stack)
- ".github/workflows/ci.yml"     (always)"""

    if is_k8s:
        k8s_manifest_rules = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KUBERNETES MANIFESTS RULES (generate these in addition to Docker)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You MUST generate 4 separate K8s configuration files:
1. "k8s/deployments.yaml":
   - Generate complete Deployments for all required services (e.g. frontend, api, db, redis, celery worker).
   - Use 'replicas: 2' for production-ready app services, and 'replicas: 1' for databases/caches.
   - Configure 'livenessProbe' and 'readinessProbe' with correct paths (e.g. httpGet to port and path /health or similar).
   - Set standard 'resources.limits' and 'resources.requests' (CPU/Memory limits).
   - Set standard non-root security context: 'securityContext.runAsNonRoot: true'.
   - Pull image referencing ghcr.io/${{ github.repository }}/${service_name}:${{ github.sha }}
2. "k8s/services.yaml":
   - Define a K8s 'Service' exposing each deployment.
   - Use 'ClusterIP' for internal microservices, database, and Redis.
   - Use 'LoadBalancer' or 'NodePort' for frontend and public entry point gateways.
3. "k8s/ingress.yaml":
   - Generate an Ingress manifest using apiVersion: networking.k8s.io/v1.
   - Route external path '/' to frontend service, and '/api' to backend API service.
4. "k8s/configmaps.yaml":
   - Declare a ConfigMap resource holding all non-sensitive environmental variables detected in project metadata (e.g. API ports, static URLs, configuration configs).

"""
        output_format_keys += """
- "k8s/deployments.yaml"         (always)
- "k8s/services.yaml"            (always)
- "k8s/ingress.yaml"             (always)
- "k8s/configmaps.yaml"          (always)"""

    ci_deploy_instructions = """- Jobs: at minimum "test" and "build" jobs; add "deploy" job as a commented-out template"""
    if is_k8s:
        ci_deploy_instructions = """- Jobs: at minimum "test" and "build" jobs; add a commented-out Kubeconfig + "deploy" job targeting Kubernetes rollout, e.g. using 'kubectl apply -f k8s/' and 'kubectl rollout status deployment/<deployment-name>'"""

    stack_rules_str = f"Stack-specific rules (MUST follow):\n{stack_specific}" if stack_specific else ""

    return f"""
You are a Docker, Kubernetes, and CI/CD expert. Analyze the following project metadata and generate production-ready configuration files.

Project metadata:
{json.dumps(context, indent=2)}

{stack_rules_str}

{pref_instruction}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCKER FILE RULES (apply to ALL stacks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Use correct minimal base images for the detected stack. Always use modern runtime versions (e.g. node:20-alpine or newer) in the frontend builder stage to satisfy modern framework requirements (like Vite 8+).
2. Always use multi-stage builds when the stack compiles/builds an artifact.
3. Set WORKDIR before COPY.
4. Always set USER (named user via groupadd/useradd) AFTER installing dependencies, NEVER before.
5. Always COPY all source files before switching to non-root USER.
6. Use nested build context in compose: build: {{ context: ., dockerfile: X }}. NEVER use build and dockerfile as sibling keys. Do NOT include the obsolete `version: '3'` or `version: '3.x'` attribute in `docker-compose.yml` as it is deprecated in the modern Compose spec. For frontend services, always include a `depends_on` block referencing the backend service to ensure correct container startup order.
7. healthcheck fields must be direct keys, never list items with dashes.
8. Default ports: Python=8000, Node=3000, Java/Go/Rust/.NET/Swift=8080, Ruby=3000, PHP=80, Elixir=4000, Flutter web=80.
   Use detected port from metadata if available.
9. .dockerignore: NEVER ignore source extensions (*.py *.go *.ts etc.), only ignore compiled/cache artifacts.
10. If has_celery=true: separate worker service in compose with celery inspect ping healthcheck.
11. If has_nginx=true: add nginx:alpine service with nginx.conf volume mount.
12. If has_frontend=true AND not a mobile-only project: Dockerfile.frontend using multi-stage node build → nginx:alpine. You MUST also generate an optimized Nginx configuration under the key "client/nginx.conf" which serves client assets on port 3000 and proxies `/api` requests dynamically using Docker's internal DNS resolver to prevent start crashes (e.g., resolver 127.0.0.11 valid=30s; set $backend http://backend:8000; proxy_pass $backend;). Note that when copying dependency manifests or running scripts inside Dockerfile.frontend, you MUST use the correct relative subdirectory prefix (e.g. COPY client/package*.json ./ and COPY client/ .), as the build context is the repository root.
13. Backend Dockerfile: COPY backend/ . (not COPY . .) if backend/ directory exists. Also, when copying package manifests or dependency lock files (e.g. COPY backend/requirements.txt .) before running the dependency installer, you MUST use the exact subdirectory prefix relative to the root build context to prevent build crashes.
14. Worker Dockerfile: COPY worker/ . (not COPY . .) if worker/ directory exists. Also, when copying dependency lock files or package manifests (e.g. COPY worker/requirements.txt .) before running the installer, you MUST use the exact subdirectory prefix relative to the root build context to prevent build crashes.
15. Always add HEALTHCHECK to every service. In docker-compose.yml, 'healthcheck.test' MUST be an array starting with either "CMD" or "CMD-SHELL", e.g. ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"] or ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1"]. Do NOT assume CLI tools like `curl` are installed in minimal base images. In Python-based containers, perform the healthcheck using pure python (e.g. `python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')"`). In Alpine Nginx containers, use `wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1` instead of `curl`.
16. Add .env.example comments in compose for env_vars found.
17. If has_db=true: add appropriate DB service (postgres:16-alpine, mysql:8, mongo:7) to compose.
18. If has_redis=true: add redis:7-alpine to compose.
19. For React Native: Dockerfile is for backend only; add a large comment explaining mobile builds use EAS/Fastlane.
20. If the backend application utilizes packages that require system executables (e.g. GitPython requiring git), you MUST include commands in the backend Dockerfile to install these system dependencies (e.g. apt-get update && apt-get install -y --no-install-recommends git) via the package manager before running the app.
21. When generating database connection URLs for PostgreSQL using SQLAlchemy, always use the `postgresql://` dialect prefix scheme instead of the deprecated and unsupported `postgres://` scheme.
22. If a Python backend or worker is used, you MUST generate a corresponding '.flake8' configuration file under the key ".flake8" which ignores cosmetic/style-only check failures (e.g. ignore E501, E302, E303, W291, W293, E305, E261, E127, E221, E272, E701, F401, E402, F541, W391, E301, E241, W292, E226) and excludes standard build, virtualenv, and package directories.
{k8s_manifest_rules}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GITHUB ACTIONS RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generate a complete, modern, and production-ready GitHub Actions CI/CD workflow:
- File path key in output JSON: ".github/workflows/ci.yml"
- Runner: {runner}
- Triggers: push to main/master, pull_request to main/master
{ci_deploy_instructions}
- Workflow Jobs Structure: You MUST cleanly separate the workflow into two distinct jobs to optimize performance:
  * 'test' job: Performs checkout, sets up language environments (e.g. Python, Node), installs dependencies, runs style/lint checks (like flake8), and executes the test suites. It must NOT build or push any container images to the registry.
  * 'build' job: Runs only after 'test' succeeds (using 'needs: test'). It performs checkout, downcases the repository name to lowercase as the first step, sets up Node/Buildx, logs into GHCR, builds the frontend client inside the client directory, and finally builds and pushes the Docker container image to GHCR.
- You MUST explicitly include a top-level workflow-level 'permissions' block (declared right below the 'on' block, above the 'jobs' block) containing 'contents: read' and 'packages: write'. This ensures that the default GITHUB_TOKEN in every job (including the 'test' and 'build' jobs) has both read access to check out repository contents (preventing git fetch/clone auth errors) and write access to publish images to GitHub Container Registry (GHCR).
- Use modern, up-to-date versions of standard GitHub Actions:
  * actions/checkout@v4
  * actions/setup-python@v5
  * actions/setup-node@v4
  * docker/setup-buildx-action@v3
  * docker/login-action@v3
  * docker/build-push-action@v5
- Caching: Always configure built-in dependency caching on all setup actions (e.g. actions/setup-python@v5 with cache: 'pip' or setup-node@v4 with cache: 'npm') to optimize pipeline execution speed. IMPORTANT: If package or lock files (such as package-lock.json or requirements.txt) are located in subdirectories (like client/ or backend/), you MUST explicitly configure 'cache-dependency-path' (e.g., cache-dependency-path: client/package-lock.json) in the setup action to prevent file-not-found cache errors, and make sure corresponding script steps use 'working-directory' (e.g., working-directory: client) to run in the correct path.
- Test Suite: Run the test suite if test_frameworks were detected. If tests require databases or external services, define mock/test environment variables (e.g., DATABASE_URL=sqlite:///:memory: or mock settings) within the test step to prevent pipeline crashes.
- Docker Registry downcasing: GitHub Container Registry (GHCR) strictly requires lowercase repository paths. You MUST add a step to downcase the GITHUB_REPOSITORY string to lowercase in an early step before building:
  * run: echo "REPO_LC=${{GITHUB_REPOSITORY,,}}" >> ${{GITHUB_ENV}}
- Registry Login: You MUST explicitly set "registry: ghcr.io" in the docker/login-action@v3 step. Use ${{GITHUB_TOKEN}} as the password and ${{github.actor}} as the username.
- Tagging and Pushing: Build the Docker image and push to ghcr.io using docker/build-push-action@v5. Tag the image as ghcr.io/${{{{ env.REPO_LC }}}}:${{{{ github.sha }}}} to ensure the repository path is entirely lowercase.
- Stack-specific GHA Setup Actions:
  * For Flutter: use subosito/flutter-action@v2
  * For Spring Boot: use actions/setup-java@v4 with distribution: temurin
  * For .NET: use actions/setup-dotnet@v4
  * For Rust: use dtolnay/rust-toolchain@stable
  * For Go: use actions/setup-go@v5
  * For PHP: use shivammathur/setup-php@v2
  * For Ruby: use ruby/setup-ruby@v1 with bundler-cache: true
  * For Elixir: use erlef/setup-beam@v1
- Environment variables: Include environment variables section referencing detected env_vars as secrets where sensitive.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY a raw JSON object. Include only the keys that are applicable:
{output_format_keys}

No markdown fences, no backticks, no explanation text. Output ONLY the JSON object.
The values are multiline strings — use \\n for newlines inside JSON strings.
"""


def _parse_response(raw: str) -> dict:
    raw = raw.strip()
    
    # Try parsing directly
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
        
    # Strip markdown fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Try to extract a JSON block using first { and last }
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1:
        try:
            return json.loads(cleaned[start:end + 1])
        except json.JSONDecodeError:
            pass

    # If all fails, fall back to the original method and let it raise JSONDecodeError
    return json.loads(raw)


def _prune_context(context: dict) -> dict:
    # Create a shallow copy so we don't modify the database record's memory representation
    pruned = dict(context)
    
    # 1. Prune file_tree if present (limit to 50 shallow files)
    if "file_tree" in pruned and isinstance(pruned["file_tree"], list):
        original_tree = pruned["file_tree"]
        pruned_tree = []
        for path in original_tree:
            norm_path = path.replace("\\", "/")
            parts = norm_path.split("/")
            
            # Skip noise dirs
            if any(p in (".git", "node_modules", "venv", ".venv", "__pycache__", "dist", "build", ".next", ".nuxt", "target", "vendor") for p in parts):
                continue
                
            # Keep if depth is shallow (<= 2 levels)
            if len(parts) <= 3:
                pruned_tree.append(path)
                
        # Aggressively limit to first 50 files if still very large
        if len(pruned_tree) > 50:
            pruned_tree = pruned_tree[:50] + [f"... and {len(pruned_tree) - 50} more files (truncated for size)"]
            
        pruned["file_tree"] = pruned_tree

    # 2. Prune package_files if present (keep only key manifests, limit to 1500 chars)
    if "package_files" in pruned:
        pkg_files = pruned["package_files"]
        if isinstance(pkg_files, dict):
            new_pkg_files = {}
            for name, content in pkg_files.items():
                base_name = name.split("\\")[-1].split("/")[-1].lower()
                # Only keep key manifest files to stay within rate/token limits
                if base_name not in ("package.json", "requirements.txt", "cargo.toml", "go.mod", "pom.xml", "build.gradle", "mix.exs", "gemfile", "composer.json", "pubspec.yaml"):
                    continue
                if isinstance(content, str):
                    if len(content) > 1500:
                        new_pkg_files[name] = content[:1500] + "\n... [content truncated for size] ..."
                    else:
                        new_pkg_files[name] = content
                else:
                    new_pkg_files[name] = content
            pruned["package_files"] = new_pkg_files
            
    return pruned


def generate_docker_files(context: dict, preferences: dict = None) -> dict:
    from app.core.config import settings
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    # Prune the context before building prompt to stay well within limits
    pruned_ctx = _prune_context(context)
    prompt = _build_prompt(pruned_ctx, preferences)

    # Use max_tokens=4000 to keep the total requested tokens well below the 12k TPM free-tier limit
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=4000,
    )

    raw = response.choices[0].message.content.strip()
    return _parse_response(raw)


def write_files(output: dict, target_dir: str):
    for filename, content in output.items():
        path = Path(target_dir) / filename
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        print(f"  [Created] {filename}")