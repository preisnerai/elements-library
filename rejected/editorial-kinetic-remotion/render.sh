#!/usr/bin/env bash
# Edytorska kinetyczna typografia (Remotion/React). Użycie: methods/editorial-kinetic-remotion/render.sh [props.json] [out.mp4]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"
PROPS="$(cd "$(dirname "${1:-$HERE/props.json}")" && pwd)/$(basename "${1:-$HERE/props.json}")"; OUT="${2:-$ROOT/out/editorial-kinetic-remotion.mp4}"
[ -d "$ROOT/node_modules/remotion" ] || (cd "$ROOT" && npm install)
# Chromium z Playwrighta (Remotion nie musi pobierać własnego headless shella)
BROWSER="${REMOTION_BROWSER:-$(ls -d ${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | tail -1)}"
cd "$ROOT" && npx remotion render "$HERE/src/index.jsx" Insert "$OUT" --props="$PROPS" ${BROWSER:+--browser-executable="$BROWSER"} \
  --codec=h264 --crf=18 --pixel-format=yuv420p --image-format=png --color-space=bt709 --concurrency=3 --log=error
