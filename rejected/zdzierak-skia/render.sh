#!/usr/bin/env bash
# Kalendarz-zdzierak (Python + skia). Użycie: methods/zdzierak-skia/render.sh [props.json] [out.mp4]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$HERE/../.."
[ -x "$ROOT/.venv/bin/python" ] || "$ROOT/tools/setup-python.sh"
[ -d "$ROOT/node_modules/@fontsource/inter" ] || (cd "$ROOT" && npm install)
"$ROOT/.venv/bin/python" "$HERE/render.py" "${1:-$HERE/props.json}" "${2:-$ROOT/out/zdzierak-skia.mp4}"
