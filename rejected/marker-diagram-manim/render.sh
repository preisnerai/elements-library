#!/usr/bin/env bash
# Diagram „markerem" (Manim CE). Użycie: methods/marker-diagram-manim/render.sh [props.json] [out.mp4]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$HERE/../.."
PROPS="$(cd "$(dirname "${1:-$HERE/props.json}")" && pwd)/$(basename "${1:-$HERE/props.json}")"; OUT="${2:-$ROOT/out/marker-diagram-manim.mp4}"
[ -x "$ROOT/.venv/bin/manim" ] || "$ROOT/tools/setup-python.sh"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
(cd "$TMP" && PROPS="$PROPS" "$ROOT/.venv/bin/manim" -q h --disable_caching --media_dir "$TMP/media" -o insert.mp4 "$HERE/scene.py" Diagram >/dev/null)
mkdir -p "$(dirname "$OUT")"
ffmpeg -hide_banner -loglevel error -y -i "$(find "$TMP/media" -name insert.mp4 | head -1)" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -an "$OUT"
echo "-> $OUT"
