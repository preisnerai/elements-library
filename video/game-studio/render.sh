#!/usr/bin/env bash
# Render całego wideo (Remotion). Użycie: video/game-studio/render.sh [out.mp4] [--frames=A-B]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"
OUT="${1:-$ROOT/out/game-studio/game-studio.mp4}"; shift || true
[ -d "$ROOT/node_modules/remotion" ] || (cd "$ROOT" && npm install)
BROWSER="${REMOTION_BROWSER:-$(ls -d ${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | tail -1)}"
mkdir -p "$(dirname "$OUT")"
cd "$ROOT" && npx remotion render "$HERE/src/index.jsx" GameStudio "$OUT" ${BROWSER:+--browser-executable="$BROWSER"} \
  --codec=h264 --crf=18 --pixel-format=yuv420p --image-format=png --color-space=bt709 --concurrency=3 --log=error "$@"
