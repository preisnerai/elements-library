#!/usr/bin/env bash
# Animowany mockup UI (HTML/CSS + GSAP, render klatka-po-klatce w Playwright).
# Użycie: methods/agent-inbox-gsap/render.sh [props.json] [out.mp4]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$HERE/../.."
PROPS="${1:-$HERE/props.json}"; OUT="${2:-$ROOT/out/agent-inbox-gsap.mp4}"
[ -d "$ROOT/node_modules/gsap" ] || (cd "$ROOT" && npm install)
mkdir -p "$(dirname "$OUT")"
node "$ROOT/tools/pw-frames.mjs" "$HERE/index.html" "$PROPS" "$OUT" 3
