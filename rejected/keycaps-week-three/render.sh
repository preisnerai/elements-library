#!/usr/bin/env bash
# Klawisze-dni w 3D (Three.js/WebGL w headless Chromium) + nakładka typograficzna w DOM.
# Użycie: methods/keycaps-week-three/render.sh [props.json] [out.mp4]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$HERE/../.."
[ -d "$ROOT/node_modules/three" ] || (cd "$ROOT" && npm install)
OUT="${2:-$ROOT/out/keycaps-week-three.mp4}"; mkdir -p "$(dirname "$OUT")"
node "$ROOT/tools/pw-frames.mjs" "$HERE/index.html" "${1:-$HERE/props.json}" "$OUT" 3
