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
