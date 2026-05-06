import os
import re
import json
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ── Stack-specific build guidance injected into the LLM prompt ───────────────
STACK_GUIDES = {
    "flutter": """
FLUTTER / DART STACK RULES:
- Dockerfile should use ghcr.io/cirruslabs/flutter:stable as builder
- Build web output: RUN flutter build web --release
- Serve with nginx:alpine, COPY --from=builder /app/build/web /usr/share/nginx/html
- docker-compose must NOT try to run Flutter app natively; it serves the web build
- GitHub Actions: use subosito/flutter-action@v2, steps: flutter pub get, flutter test, flutter build web
""",
    "react_native": """
REACT NATIVE / EXPO STACK RULES:
- React Native apps cannot run in Docker containers (they target iOS/Android)
- Dockerfile should be for any backend API service only
- For Expo managed: GitHub Actions should use expo-github-action to run eas build
- docker-compose is only for backend services, not the mobile app itself
- Clearly comment in generated files that mobile build is handled by EAS/Fastlane
""",
    "spring_boot": """
SPRING BOOT STACK RULES:
- Multi-stage Dockerfile: maven:3.9-eclipse-temurin-21 to build, eclipse-temurin:21-jre-jammy to run
- Build command: RUN mvn clean package -DskipTests
- Run: ENTRYPOINT ["java", "-jar", "app.jar"]
- Expose port 8080 by default
- GitHub Actions: use actions/setup-java@v4 with distribution: temurin, java-version: 21
- Include: mvn test in CI
""",
    "go": """
GO STACK RULES:
- Multi-stage Dockerfile: golang:1.22-alpine to build, scratch or alpine:3.19 to run
- Build: RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app ./...
- Copy only the binary into scratch/alpine final image
- GitHub Actions: use actions/setup-go@v5, run go test ./..., go build
- Default port 8080
""",
    "rust": """
RUST STACK RULES:
- Multi-stage Dockerfile: rust:1.77-slim as builder, debian:bookworm-slim as runner
- Build: RUN cargo build --release
- Copy target/release/<binary> to runner
- GitHub Actions: use actions-rs/toolchain or dtolnay/rust-toolchain, run cargo test, cargo build --release
- Default port 8080
""",
    "dotnet": """
.NET / ASP.NET CORE STACK RULES:
- Multi-stage Dockerfile: mcr.microsoft.com/dotnet/sdk:8.0 to build, mcr.microsoft.com/dotnet/aspnet:8.0 to run
- Build: RUN dotnet publish -c Release -o /app/publish
- GitHub Actions: use actions/setup-dotnet@v4 with dotnet-version: 8.x
- Run: dotnet test, dotnet publish in CI
- Default port 8080 (set via ASPNETCORE_URLS)
""",
    "php": """
PHP / LARAVEL / SYMFONY STACK RULES:
- Dockerfile: php:8.3-fpm-alpine + nginx:alpine in same compose, or php:8.3-apache
- Install composer: COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
- Run: composer install --no-dev --optimize-autoloader
- For Laravel: php artisan config:cache, php artisan route:cache
- GitHub Actions: use shivammathur/setup-php@v2 with php-version: 8.3
- Run: composer test or vendor/bin/phpunit
""",
    "ruby": """
RUBY / RAILS STACK RULES:
- Dockerfile: ruby:3.3-slim, install bundler, run bundle install --without development test
- For Rails: precompile assets, run migrations via entrypoint
- GitHub Actions: use ruby/setup-ruby@v1 with bundler-cache: true
- Run: bundle exec rspec or bundle exec rails test
- Default port 3000
""",
    "elixir": """
ELIXIR / PHOENIX STACK RULES:
- Multi-stage Dockerfile: elixir:1.16-alpine to build mix release, alpine:3.19 to run
- Build: RUN mix deps.get --only prod && mix compile && mix release
- GitHub Actions: elixir-lang/setup-elixir or setup with erlef/setup-beam@v1
- Run: mix test in CI
- Default port 4000
""",
    "swift": """
SWIFT STACK RULES:
- Dockerfile: swift:5.10-jammy to build, ubuntu:22.04 to run
- Build: RUN swift build -c release
- GitHub Actions: use swift-actions/setup-swift@v2
- Default port 8080
""",
}


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


def _build_prompt(context: dict) -> str:
    stack_specific = _collect_stack_guides(context)
    runner = _infer_runner(context)

    return f"""
You are a Docker and CI/CD expert. Analyze the following project metadata and generate production-ready configuration files.

Project metadata:
{json.dumps(context, indent=2)}

{("Stack-specific rules (MUST follow):\n" + stack_specific) if stack_specific else ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCKER FILE RULES (apply to ALL stacks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Use correct minimal base images for the detected stack.
2. Always use multi-stage builds when the stack compiles/builds an artifact.
3. Set WORKDIR before COPY.
4. Always set USER (named user via groupadd/useradd) AFTER installing dependencies, NEVER before.
5. Always COPY all source files before switching to non-root USER.
6. Use nested build context in compose: build: {{ context: ., dockerfile: X }}
   NEVER use build and dockerfile as sibling keys.
7. healthcheck fields must be direct keys, never list items with dashes.
8. Default ports: Python=8000, Node=3000, Java/Go/Rust/.NET/Swift=8080, Ruby=3000, PHP=80, Elixir=4000, Flutter web=80.
   Use detected port from metadata if available.
9. .dockerignore: NEVER ignore source extensions (*.py *.go *.ts etc.), only ignore compiled/cache artifacts.
10. If has_celery=true: separate worker service in compose with celery inspect ping healthcheck.
11. If has_nginx=true: add nginx:alpine service with nginx.conf volume mount.
12. If has_frontend=true AND not a mobile-only project: Dockerfile.frontend using multi-stage node build → nginx:alpine.
13. Backend Dockerfile: COPY backend/ . (not COPY . .) if backend/ directory exists.
14. Worker Dockerfile: COPY worker/ . (not COPY . .) if worker/ directory exists.
15. Always add HEALTHCHECK to every service.
16. Add .env.example comments in compose for env_vars found.
17. If has_db=true: add appropriate DB service (postgres:16-alpine, mysql:8, mongo:7) to compose.
18. If has_redis=true: add redis:7-alpine to compose.
19. For React Native: Dockerfile is for backend only; add a large comment explaining mobile builds use EAS/Fastlane.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GITHUB ACTIONS RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generate a complete GitHub Actions CI/CD workflow with these characteristics:
- Runner: {runner}
- File path key in output JSON: ".github/workflows/ci.yml"
- Triggers: push to main/master, pull_request to main/master
- Jobs: at minimum "test" and "build" jobs; add "deploy" job as a commented-out template
- Use correct language setup action for the detected stack (e.g. actions/setup-python, actions/setup-java, etc.)
- Cache dependencies (pip, npm/yarn, gradle, cargo, go modules, bundler, composer, mix deps, etc.)
- Run test suite if test_frameworks were detected
- Build Docker image and push to ghcr.io (GitHub Container Registry) in "build" job
- Use docker/setup-buildx-action and docker/build-push-action
- Tag image as ghcr.io/${{{{ github.repository }}}}:${{{{ github.sha }}}}
- For Flutter: use subosito/flutter-action@v2
- For Spring Boot: use actions/setup-java@v4 with distribution: temurin
- For .NET: use actions/setup-dotnet@v4
- For Rust: use dtolnay/rust-toolchain@stable
- For Go: use actions/setup-go@v5
- For PHP: use shivammathur/setup-php@v2
- For Ruby: use ruby/setup-ruby@v1 with bundler-cache: true
- For Elixir: use erlef/setup-beam@v1
- Include GITHUB_TOKEN permissions block
- Include environment variables section referencing detected env_vars as secrets where sensitive

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY a raw JSON object. Include only the keys that are applicable:
- "Dockerfile"                   (always)
- "Dockerfile.frontend"          (only if has_frontend=true and NOT mobile-only)
- "Dockerfile.worker"            (only if has_celery=true)
- "docker-compose.yml"           (always)
- ".dockerignore"                (always)
- ".github/workflows/ci.yml"     (always)

No markdown fences, no backticks, no explanation text. Output ONLY the JSON object.
The values are multiline strings — use \\n for newlines inside JSON strings.
"""


def _parse_response(raw: str) -> dict:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()
    return json.loads(raw)


def generate_docker_files(context: dict) -> dict:
    from app.core.config import settings
    client = Groq(api_key=settings.GROQ_API_KEY)
    prompt = _build_prompt(context)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=8192,
    )

    raw = response.choices[0].message.content.strip()
    return _parse_response(raw)


def write_files(output: dict, target_dir: str):
    for filename, content in output.items():
        path = Path(target_dir) / filename
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        print(f"  ✅ {filename}")