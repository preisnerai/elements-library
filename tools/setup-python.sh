#!/usr/bin/env bash
# Środowisko Python dla metod skia/cairo/manim. Na Ubuntu: apt-get install libegl1 libpango1.0-dev pkg-config libcairo2-dev
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q numpy pillow skia-python pycairo manim fonttools brotli
