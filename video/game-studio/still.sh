#!/usr/bin/env bash
# Podgląd pojedynczych klatek: video/game-studio/still.sh <sekunda> [<sekunda>...] → out/game-studio/stills/t<sek>.png
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"
BROWSER="${REMOTION_BROWSER:-$(ls -d ${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | tail -1)}"
OUTDIR="${STILLS_DIR:-$ROOT/out/game-studio/stills}"; mkdir -p "$OUTDIR"
BUNDLE="${BUNDLE_DIR:-/tmp/gs-bundle-$$}"
cd "$ROOT" && npx remotion bundle "$HERE/src/index.jsx" --out-dir="$BUNDLE" --log=error >/dev/null
for s in "$@"; do f=$(awk -v s="$s" 'BEGIN{printf "%d", s*30}'); npx remotion still "$BUNDLE" GameStudio "$OUTDIR/t$s.png" --frame="$f" ${BROWSER:+--browser-executable="$BROWSER"} --log=error; done
rm -rf "$BUNDLE"
