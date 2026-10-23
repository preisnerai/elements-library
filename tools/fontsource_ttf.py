"""Skleja podzbiory latin + latin-ext z @fontsource/* (woff2) w jeden TTF — dla skia/cairo/manim (polskie znaki).
Użycie: python tools/fontsource_ttf.py <pakiet> <waga> [styl]  → wypisuje ścieżkę do .cache/fonts/<pakiet>-<waga>-<styl>.ttf"""
import sys, os
from fontTools.ttLib import TTFont
from fontTools.merge import Merger

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def ttf(pkg, weight, style="normal"):
    out_dir = os.path.join(ROOT, ".cache", "fonts"); os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f"{pkg}-{weight}-{style}.ttf")
    if os.path.exists(out):
        return out
    files = os.path.join(ROOT, "node_modules", "@fontsource", pkg, "files")
    parts = []
    for sub in ("latin", "latin-ext"):
        src = os.path.join(files, f"{pkg}-{sub}-{weight}-{style}.woff2")
        f = TTFont(src); f.flavor = None
        p = os.path.join(out_dir, f"_{pkg}-{sub}-{weight}.ttf"); f.save(p); parts.append(p)
    merged = Merger().merge(parts)
    merged.save(out)
    for p in parts: os.remove(p)
    return out

if __name__ == "__main__":
    print(ttf(*sys.argv[1:]))
