import re
import json
from pathlib import Path

# ── Package / manifest files ────────────────────────────────────────────────
PACKAGE_FILES = {
    # Python
    "requirements.txt", "pyproject.toml", "Pipfile", "setup.py", "setup.cfg",
    # Node / JS / TS
    "package.json", "yarn.lock", "pnpm-lock.yaml",
    # JVM
    "pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle",
    "settings.gradle.kts", "gradle.properties",
    # Go
    "go.mod", "go.sum",
    # Rust
    "Cargo.toml", "Cargo.lock",
    # Ruby
    "Gemfile", "Gemfile.lock",
    # PHP
    "composer.json", "composer.lock",
    # .NET
    "*.csproj", "*.fsproj", "*.vbproj", "global.json", "nuget.config",
    # Dart / Flutter
    "pubspec.yaml", "pubspec.lock",
    # Swift / iOS
    "Package.swift", "Podfile", "Podfile.lock",
    # Kotlin Multiplatform / Android
    "build.gradle", "build.gradle.kts",
    # Elixir
    "mix.exs", "mix.lock",
    # Haskell
    "stack.yaml", "cabal.project", "*.cabal",
    # Clojure
    "project.clj", "deps.edn",
    # Scala
    "build.sbt",
    # C / C++
    "CMakeLists.txt", "Makefile", "meson.build",
    # Terraform / Infra
    "main.tf",
    # Docker Compose already present
    "docker-compose.yml", "docker-compose.yaml",
}

# ── Framework keyword → display name ────────────────────────────────────────
FRAMEWORK_HINTS = {
    # Python
    "flask": "Flask",
    "django": "Django",
    "fastapi": "FastAPI",
    "tornado": "Tornado",
    "aiohttp": "aiohttp",
    "starlette": "Starlette",
    "sanic": "Sanic",
    "bottle": "Bottle",
    "pyramid": "Pyramid",
    "falcon": "Falcon",
    # Node / JS
    "express": "Express",
    "koa": "Koa",
    "hapi": "Hapi",
    "fastify": "Fastify",
    "nestjs": "@nestjs",
    "nextjs": "Next.js",
    "nuxt": "Nuxt",
    "remix": "Remix",
    "astro": "Astro",
    "sveltekit": "SvelteKit",
    "react": "React",
    "vue": "Vue",
    "svelte": "Svelte",
    "angular": "Angular",
    "gatsby": "Gatsby",
    # JVM
    "spring": "Spring Boot",
    "micronaut": "Micronaut",
    "quarkus": "Quarkus",
    "ktor": "Ktor",
    "vertx": "Vert.x",
    "play": "Play Framework",
    # Go
    "gin": "Gin",
    "echo": "Echo",
    "fiber": "Fiber",
    "chi": "Chi",
    "gorilla": "Gorilla Mux",
    # Rust
    "actix": "Actix-web",
    "axum": "Axum",
    "rocket": "Rocket",
    "warp": "Warp",
    # Ruby
    "rails": "Rails",
    "sinatra": "Sinatra",
    "hanami": "Hanami",
    # PHP
    "laravel": "Laravel",
    "symfony": "Symfony",
    "slim": "Slim",
    "lumen": "Lumen",
    "codeigniter": "CodeIgniter",
    "yii": "Yii",
    # .NET
    "aspnet": "ASP.NET Core",
    "microsoft.aspnetcore": "ASP.NET Core",
    "blazor": "Blazor",
    "maui": ".NET MAUI",
    # Flutter / Dart
    "flutter": "Flutter",
    "dart": "Dart",
    # React Native
    "react-native": "React Native",
    "expo": "Expo",
    # Elixir
    "phoenix": "Phoenix",
    "plug": "Plug",
    # Scala
    "akka": "Akka",
    "http4s": "http4s",
    "zio": "ZIO",
    # Kotlin
    "ktor": "Ktor",
    # Haskell
    "servant": "Servant",
    "yesod": "Yesod",
    "scotty": "Scotty",
    # C/C++
    "boost": "Boost",
    "crow": "Crow",
    "drogon": "Drogon",
    # Mobile / Cross-platform
    "capacitor": "Capacitor",
    "ionic": "Ionic",
    "cordova": "Cordova",
    "xamarin": "Xamarin",
    # ML / Data
    "fastai": "FastAI",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "keras": "Keras",
    "scikit": "scikit-learn",
    "streamlit": "Streamlit",
    "gradio": "Gradio",
}

# ── Entry points per language ────────────────────────────────────────────────
ENTRY_POINTS = {
    # Python
    "main.py", "app.py", "server.py", "run.py", "manage.py", "wsgi.py", "asgi.py",
    # Node
    "index.js", "server.js", "app.js", "index.ts", "server.ts", "app.ts",
    # Go
    "main.go",
    # Rust
    "main.rs",
    # Java
    "Main.java", "Application.java",
    # Kotlin
    "Main.kt", "Application.kt",
    # Dart
    "main.dart", "lib/main.dart",
    # C#
    "Program.cs", "Startup.cs",
    # Ruby
    "app.rb", "config.ru",
    # PHP
    "index.php", "public/index.php", "artisan",
    # Elixir
    "mix.exs",
    # Swift
    "main.swift",
    # C / C++
    "main.c", "main.cpp",
    # Scala
    "Main.scala",
    # Haskell
    "Main.hs", "main.hs",
    # Shell scripts used as entrypoints
    "entrypoint.sh", "docker-entrypoint.sh", "start.sh",
}

# ── Directories to skip entirely ────────────────────────────────────────────
SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv",
    "env", ".env", "dist", "build", ".next", "target", ".dart_tool",
    ".pub-cache", ".gradle", ".idea", ".vscode", "vendor", "pods",
    "ios/Pods", "android/.gradle", "android/build", ".flutter-plugins",
    ".flutter-plugins-dependencies", "coverage", ".nyc_output", "out",
    "bin", "obj", ".terraform", ".serverless", "tmp", "temp", "logs",
    "*.egg-info", "__snapshots__",
}

# ── Extension → Language ────────────────────────────────────────────────────
EXT_LANGUAGE_MAP = {
    ".py": "Python",
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".jsx": "JavaScript",
    ".go": "Go",
    ".java": "Java",
    ".kt": "Kotlin",
    ".kts": "Kotlin",
    ".rb": "Ruby",
    ".rs": "Rust",
    ".php": "PHP",
    ".cs": "C#",
    ".fs": "F#",
    ".vb": "VB.NET",
    ".cpp": "C++",
    ".cc": "C++",
    ".cxx": "C++",
    ".c": "C",
    ".h": "C/C++",
    ".swift": "Swift",
    ".dart": "Dart",
    ".ex": "Elixir",
    ".exs": "Elixir",
    ".scala": "Scala",
    ".clj": "Clojure",
    ".cljs": "ClojureScript",
    ".hs": "Haskell",
    ".erl": "Erlang",
    ".ml": "OCaml",
    ".r": "R",
    ".jl": "Julia",
    ".lua": "Lua",
    ".pl": "Perl",
    ".sh": "Shell",
    ".tf": "Terraform",
}

# ── DB / cache / queue keyword sets ─────────────────────────────────────────
DB_KEYWORDS = [
    "postgres", "postgresql", "psycopg", "asyncpg",
    "mysql", "mariadb", "pymysql",
    "sqlite", "libsqlite",
    "sqlalchemy", "alembic",
    "mongoose", "mongodb", "motor",
    "prisma", "sequelize", "typeorm", "drizzle",
    "hibernate", "jpa", "spring-data",
    "ecto", "phoenix_ecto",
    "activerecord",
    "doctrine",
    "gorm", "sqlx", "pgx",
    "diesel",
    "cassandra", "couchdb", "dynamodb", "firestore",
    "supabase",
]

REDIS_KEYWORDS = ["redis", "ioredis", "jedis", "lettuce", "stackexchange.redis", "redigo"]
CELERY_KEYWORDS = ["celery", "dramatiq", "huey", "rq"]
NGINX_FILES = {"nginx.conf", "nginx.conf.template", "default.conf"}
MOBILE_MARKERS = {"pubspec.yaml", "app.json", "metro.config.js"}

# CI/CD platform hints
CICD_FILES = {
    ".travis.yml": "Travis CI",
    "Jenkinsfile": "Jenkins",
    "bitbucket-pipelines.yml": "Bitbucket Pipelines",
    "circle.yml": ".circleci/config.yml",
    "azure-pipelines.yml": "Azure Pipelines",
    "appveyor.yml": "AppVeyor",
}


def _should_skip(path_parts: tuple) -> bool:
    for part in path_parts:
        if part in SKIP_DIRS:
            return True
        # catch egg-info and similar
        if part.endswith((".egg-info", ".dist-info")):
            return True
    return False


def analyze_project(root: str) -> dict:
    root = Path(root).resolve()

    context = {
        "project_name": root.name,
        "languages": [],
        "frameworks": [],
        "package_files": {},
        "entry_points": [],
        "env_vars": [],
        "ports": [],
        "has_db": False,
        "has_redis": False,
        "has_celery": False,
        "has_nginx": False,
        "has_frontend": False,
        "has_backend": False,
        "has_mobile": False,
        "is_monorepo": False,
        "is_flutter": False,
        "is_react_native": False,
        "is_dotnet": False,
        "is_spring_boot": False,
        "is_go": False,
        "is_rust": False,
        "is_php": False,
        "is_ruby": False,
        "is_elixir": False,
        "is_swift": False,
        "services": [],
        "file_tree": [],
        "test_frameworks": [],
        "ci_cd": [],
        "cloud_provider": [],
    }

    ext_counts: dict[str, int] = {}
    all_package_names: list[str] = []

    for path in root.rglob("*"):
        if _should_skip(path.parts):
            continue
        if not path.is_file():
            continue

        rel = str(path.relative_to(root))
        context["file_tree"].append(rel)

        ext = path.suffix.lower()
        ext_counts[ext] = ext_counts.get(ext, 0) + 1

        # ── Nginx ───────────────────────────────────────────────────────────
        if path.name in NGINX_FILES:
            context["has_nginx"] = True

        # ── Mobile markers ──────────────────────────────────────────────────
        if path.name in MOBILE_MARKERS:
            context["has_mobile"] = True

        # ── .csproj / .fsproj  ──────────────────────────────────────────────
        if path.suffix in (".csproj", ".fsproj", ".vbproj"):
            context["is_dotnet"] = True
            try:
                text = path.read_text(errors="ignore")
                context["package_files"][path.name] = text[:4000]
                _apply_framework_hints(text, context, path.name)
            except Exception:
                pass

        # ── Standard package files ──────────────────────────────────────────
        if path.name in PACKAGE_FILES:
            try:
                text = path.read_text(errors="ignore")
                context["package_files"][path.name] = text[:4000]
                text_lower = text.lower()

                _apply_framework_hints(text_lower, context, path.name)
                _detect_infra(text_lower, context)
                _detect_test_frameworks(text_lower, context)

                # per-file stack flags
                if path.name == "pubspec.yaml":
                    context["is_flutter"] = True
                if path.name in ("package.json",):
                    pkg = {}
                    try:
                        pkg = json.loads(text)
                    except Exception:
                        pass
                    deps = {
                        **pkg.get("dependencies", {}),
                        **pkg.get("devDependencies", {}),
                    }
                    all_package_names.extend(deps.keys())
                    if "react-native" in deps or "expo" in deps:
                        context["is_react_native"] = True
                if path.name in ("go.mod",):
                    context["is_go"] = True
                if path.name == "Cargo.toml":
                    context["is_rust"] = True
                if path.name == "composer.json":
                    context["is_php"] = True
                if path.name in ("Gemfile", "Gemfile.lock"):
                    context["is_ruby"] = True
                if path.name == "mix.exs":
                    context["is_elixir"] = True
                if path.name == "Package.swift":
                    context["is_swift"] = True
                if path.name in ("build.gradle", "build.gradle.kts", "pom.xml"):
                    if "spring" in text_lower or "springboot" in text_lower:
                        context["is_spring_boot"] = True

            except Exception:
                pass

        # ── Entry points ────────────────────────────────────────────────────
        if path.name in ENTRY_POINTS or rel in ENTRY_POINTS:
            if rel not in context["entry_points"]:
                context["entry_points"].append(rel)

        # ── Celery worker file ──────────────────────────────────────────────
        if path.name == "worker.py":
            try:
                text = path.read_text(errors="ignore")
                if "celery" in text.lower():
                    context["has_celery"] = True
                    worker_dir = str(path.parent.relative_to(root))
                    if worker_dir and worker_dir not in context["services"]:
                        context["services"].append(worker_dir)
            except Exception:
                pass

        # ── .env example files ──────────────────────────────────────────────
        if path.name in (".env.example", ".env.sample", ".env.template", ".env.test"):
            try:
                for line in path.read_text(errors="ignore").splitlines():
                    line = line.strip()
                    if "=" in line and not line.startswith("#") and line:
                        var = line.split("=")[0].strip()
                        if var and var not in context["env_vars"]:
                            context["env_vars"].append(var)
            except Exception:
                pass

        # ── Port detection ──────────────────────────────────────────────────
        if path.suffix in (
            ".py", ".js", ".ts", ".go", ".java", ".rb", ".rs",
            ".php", ".cs", ".kt", ".ex", ".exs", ".dart", ".scala",
        ):
            try:
                text = path.read_text(errors="ignore")
                ports = re.findall(
                    r'(?:port|PORT)[=\s:\"\']+(\d{4,5})', text, re.IGNORECASE
                )
                context["ports"].extend(p for p in ports if p not in context["ports"])
            except Exception:
                pass

        # ── Existing CI/CD detection ────────────────────────────────────────
        if path.name in CICD_FILES:
            label = CICD_FILES[path.name]
            if label not in context["ci_cd"]:
                context["ci_cd"].append(label)
        if ".github/workflows" in rel and path.suffix in (".yml", ".yaml"):
            if "GitHub Actions" not in context["ci_cd"]:
                context["ci_cd"].append("GitHub Actions")

        # ── Cloud provider hints ────────────────────────────────────────────
        if path.name in ("serverless.yml", "serverless.yaml"):
            _add_unique(context["cloud_provider"], "Serverless Framework")
        if path.name in ("app.yaml",) and "appengine" in rel.lower():
            _add_unique(context["cloud_provider"], "Google App Engine")
        if path.name in ("fly.toml",):
            _add_unique(context["cloud_provider"], "Fly.io")
        if path.name in ("railway.json", "railway.toml"):
            _add_unique(context["cloud_provider"], "Railway")
        if path.name in ("render.yaml",):
            _add_unique(context["cloud_provider"], "Render")
        if ".github/workflows" in rel or path.name == "Procfile":
            pass  # already handled

        # ── Monorepo detection ──────────────────────────────────────────────
        if path.name in ("lerna.json", "nx.json", "turbo.json", "pnpm-workspace.yaml"):
            context["is_monorepo"] = True

    # ── Structural monorepo detection ───────────────────────────────────────
    # If the root has 2+ subdirectories that each contain a package/manifest
    # file, treat it as a monorepo even without an explicit monorepo tool.
    SERVICE_MANIFEST_FILES = {
        "requirements.txt", "pyproject.toml", "package.json", "go.mod",
        "Cargo.toml", "pom.xml", "build.gradle", "composer.json",
        "Gemfile", "mix.exs", "pubspec.yaml", "Package.swift",
    }
    top_level_service_dirs = set()
    for path in root.iterdir():
        if path.is_dir() and not _should_skip(path.parts):
            has_manifest = any(
                (path / mf).exists() for mf in SERVICE_MANIFEST_FILES
            )
            if has_manifest:
                top_level_service_dirs.add(path.name)
    if len(top_level_service_dirs) >= 2:
        context["is_monorepo"] = True
        context["services"] = list(
            set(context["services"]) | top_level_service_dirs
        )

    # ── Resolve languages ───────────────────────────────────────────────────
    context["languages"] = list({
        EXT_LANGUAGE_MAP[e] for e in ext_counts if e in EXT_LANGUAGE_MAP
    })

    # ── Frontend / backend heuristic ────────────────────────────────────────
    tree_str = " ".join(context["file_tree"]).lower()
    context["has_frontend"] = any(
        x in tree_str for x in ["frontend", "client", "ui", "public", "web", "pages", "views"]
    )
    context["has_backend"] = any(
        x in tree_str for x in ["backend", "server", "api", "services", "controllers"]
    )

    context["ports"] = list(dict.fromkeys(context["ports"]))  # deduplicate, preserve order

    # ── React Native extra check via package names ──────────────────────────
    if any("react-native" in p or p == "expo" for p in all_package_names):
        context["is_react_native"] = True

    return context


# ── Helpers ──────────────────────────────────────────────────────────────────

def _add_unique(lst: list, item: str):
    if item not in lst:
        lst.append(item)


def _apply_framework_hints(text_lower: str, context: dict, filename: str = ""):
    """
    Match framework keywords against file content, but only when the keyword
    belongs to a language that is plausible for the file being parsed.
    This prevents cross-language false positives (e.g. 'gin' inside a Python
    requirements.txt matching the Go Gin framework).
    """
    # Keywords that are too generic and must be restricted to specific file types
    GO_ONLY      = {"gin", "echo", "fiber", "chi", "gorilla"}
    RUST_ONLY    = {"actix", "axum", "rocket", "warp"}
    RUBY_ONLY    = {"rails", "sinatra", "hanami"}
    PHP_ONLY     = {"laravel", "symfony", "slim", "lumen", "codeigniter", "yii"}
    JVM_ONLY     = {"spring", "micronaut", "quarkus", "vertx", "play", "akka", "http4s", "zio"}
    ELIXIR_ONLY  = {"phoenix", "plug"}
    HASKELL_ONLY = {"servant", "yesod", "scotty"}

    is_go_file      = filename in ("go.mod", "go.sum") or filename.endswith(".go")
    is_rust_file    = filename in ("Cargo.toml", "Cargo.lock") or filename.endswith(".rs")
    is_ruby_file    = filename in ("Gemfile", "Gemfile.lock") or filename.endswith(".rb")
    is_php_file     = filename in ("composer.json", "composer.lock") or filename.endswith(".php")
    is_jvm_file     = filename in ("pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle",
                                    "settings.gradle.kts") or filename.endswith((".java", ".kt", ".scala"))
    is_elixir_file  = filename in ("mix.exs", "mix.lock") or filename.endswith((".ex", ".exs"))
    is_haskell_file = filename in ("stack.yaml",) or filename.endswith(".hs")

    for key, name in FRAMEWORK_HINTS.items():
        if key not in text_lower:
            continue
        if name in context["frameworks"]:
            continue
        # Apply language-gated rules
        if key in GO_ONLY      and not is_go_file:      continue
        if key in RUST_ONLY    and not is_rust_file:    continue
        if key in RUBY_ONLY    and not is_ruby_file:    continue
        if key in PHP_ONLY     and not is_php_file:     continue
        if key in JVM_ONLY     and not is_jvm_file:     continue
        if key in ELIXIR_ONLY  and not is_elixir_file:  continue
        if key in HASKELL_ONLY and not is_haskell_file: continue
        context["frameworks"].append(name)


def _detect_infra(text_lower: str, context: dict):
    if any(k in text_lower for k in DB_KEYWORDS):
        context["has_db"] = True
    if any(k in text_lower for k in REDIS_KEYWORDS):
        context["has_redis"] = True
    if any(k in text_lower for k in CELERY_KEYWORDS):
        context["has_celery"] = True


def _detect_test_frameworks(text_lower: str, context: dict):
    TEST_FW = {
        "pytest": "pytest",
        "unittest": "unittest",
        "jest": "Jest",
        "vitest": "Vitest",
        "mocha": "Mocha",
        "jasmine": "Jasmine",
        "cypress": "Cypress",
        "playwright": "Playwright",
        "rspec": "RSpec",
        "minitest": "Minitest",
        "phpunit": "PHPUnit",
        "junit": "JUnit",
        "testng": "TestNG",
        "gtest": "GoogleTest",
        "catch2": "Catch2",
        "exunit": "ExUnit",
        "hspec": "HSpec",
        "scalatest": "ScalaTest",
        "flutter_test": "Flutter Test",
        "go test": "Go Test",
        "cargo test": "Cargo Test",
    }
    for key, name in TEST_FW.items():
        if key in text_lower and name not in context["test_frameworks"]:
            context["test_frameworks"].append(name)