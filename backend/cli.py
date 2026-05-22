import sys
import argparse
from pathlib import Path

# Dynamically resolve app/services directory and inject it into sys.path
services_dir = Path(__file__).resolve().parent / "app" / "services"
sys.path.insert(0, str(services_dir))

from analyzer import analyze_project
from generator import generate_docker_files, write_files


def main():
    parser = argparse.ArgumentParser(
        description="DockerGen -- auto-generate Docker + GitHub Actions files for any stack",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py ../my-flask-app
  python main.py ../my-spring-api --out ./generated
  python main.py ../my-project --json
        """,
    )
    parser.add_argument("project_path", help="Path to the project root")
    parser.add_argument(
        "--out",
        default=None,
        help="Output directory (default: project_path itself)",
    )
    parser.add_argument(
        "--json",
        dest="dump_json",
        action="store_true",
        help="Dump analyzed context as JSON to stdout and exit (no generation)",
    )
    args = parser.parse_args()

    project_path = args.project_path
    output_dir = args.out or project_path

    print(f"\n[DockerGen] Analyzing: {project_path}")
    context = analyze_project(project_path)

    if args.dump_json:
        import json
        print(json.dumps(context, indent=2))
        return

    def _fmt(lst):
        return ", ".join(lst) if lst else "-"

    print(f"   Project     : {context['project_name']}")
    print(f"   Language(s) : {_fmt(context['languages'])}")
    print(f"   Framework(s): {_fmt(context['frameworks'])}")
    print(f"   Entry points: {_fmt(context['entry_points'])}")
    print(f"   Ports found : {_fmt(context['ports'])}")
    print(f"   Test FW     : {_fmt(context['test_frameworks'])}")
    print(f"   Database    : {'Yes' if context['has_db']     else 'No'}")
    print(f"   Redis       : {'Yes' if context['has_redis']  else 'No'}")
    print(f"   Celery      : {'Yes' if context['has_celery'] else 'No'}")
    print(f"   Nginx       : {'Yes' if context['has_nginx']  else 'No'}")
    print(f"   Mobile      : {'Yes' if context['has_mobile'] else 'No'}")
    print(f"   Flutter     : {'Yes' if context['is_flutter'] else 'No'}")
    print(f"   React Native: {'Yes' if context['is_react_native'] else 'No'}")
    print(f"   Spring Boot : {'Yes' if context['is_spring_boot'] else 'No'}")
    print(f"   Go          : {'Yes' if context['is_go']      else 'No'}")
    print(f"   Rust        : {'Yes' if context['is_rust']    else 'No'}")
    print(f"   .NET        : {'Yes' if context['is_dotnet']  else 'No'}")
    print(f"   PHP         : {'Yes' if context['is_php']     else 'No'}")
    print(f"   Ruby        : {'Yes' if context['is_ruby']    else 'No'}")
    print(f"   Elixir      : {'Yes' if context['is_elixir']  else 'No'}")
    print(f"   Monorepo    : {'Yes' if context['is_monorepo'] else 'No'}")

    print(f"\n[DockerGen] Generating files via Groq...")
    try:
        docker_files = generate_docker_files(context)
    except Exception as e:
        print(f"\n[Error] Generation failed: {e}")
        sys.exit(1)

    print(f"\n[DockerGen] Writing files to: {output_dir}/")
    write_files(docker_files, output_dir)

    print(f"\n[DockerGen] Done! {len(docker_files)} file(s) written:")
    for f in docker_files:
        icon = "[Config]" if f.endswith((".yml", ".yaml")) else "[Docker]"
        print(f"   {icon}  {f}")

    if ".github/workflows/ci.yml" in docker_files:
        print("\n[DockerGen] GitHub Actions workflow -> .github/workflows/ci.yml")
        print("    Commit & push -> Actions tab -> pipeline runs automatically.")


if __name__ == "__main__":
    main()