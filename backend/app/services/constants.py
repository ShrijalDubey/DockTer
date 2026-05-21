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
