# LEDGER — R&D: wstawki wideo robione kodem (1080x1920, 30 fps, 6–8 s)

Stan pracy trzymany tutaj. Po kompaktowaniu kontekstu czytaj od góry.

## Konfiguracja
ITERACJE_MAX = 5 · MAX_POPRAWEK_NA_POMYSL = 2 · PROG_OCENY = 8

## Środowisko (sprawdzone 2026-10-23)
- ffmpeg 6.1.1, Node 22, Python 3.13 (`.venv`), Chromium 1194 via Playwright 1.56.1, skia-python 144, pycairo 1.29, manim 0.22, gsap 3, three.
- apt działa mimo opisu sieci → doinstalowano `libegl1` (wymagane przez skia-python) i `libpango1.0-dev` (manim).
- Fonty: systemowe Inter / Inter Display / JetBrains Mono + `@fontsource/*` z npm.

## Decyzje / założenia (przy niejasnościach)
- Ścieżki `out/`, `methods/`, `LEDGER.md`, `SUMMARY.md` w root repo, jak w briefie. `node_modules/` i `.venv/` w `.gitignore` — odtworzenie: `npm install` + `tools/setup-python.sh`.
- Strefa bezpieczna TikTok/IG: góra 240 px, dół 480 px, lewo 80 px, prawo 140 px → treść krytyczna w prostokącie x 80–940, y 240–1440.
- Wstawka ma mieć ciągły mikro-ruch (brak zamrożeń > 0,5 s) — pilnuje tego `freezedetect` w `tools/review.sh`.
- Krytyk: osobny subagent (sonnet), dostaje tylko contact sheet (12 klatek 360x640 z timestampem), rubrykę i listę nazw poprzednich pomysłów. Ocena końcowa = średnia z 5 kryteriów.
- Pomysły odrzucone → kod przenoszę do `rejected/<slug>/` (zostaje jako wynik badania), rendery zostają w `out/`.
- Język treści we wstawkach: polski.

## Iteracje
| nr | slug | technika | styl | ocena v1→końc. | status | czas pracy | wniosek |
|---|---|---|---|---|---|---|---|
| 001 | agent-inbox-gsap | HTML/CSS + GSAP → Playwright (CDP screenshot) → ffmpeg | dark UI mockup (v1–v2 glass+lime, v3 papierowe bileciki+mono+pomarańcz) | 5.6 → 6.2 → 6.0 | ODRZUĆ | ~35 min (render v1 343 s → v3 55 s) | Mockup UI z wieloma wierszami = mikrotekst, którego nie da się czytać na telefonie; krytyk konsekwentnie daje oryginalność 5 („SaaS dashboard”). Działa: gigantyczna liczba jako bohater, spójna arytmetyka liczników. Unikać: >3 poziomów tekstu, tekstu < 42 px, crossfade’ów w tym samym miejscu, martwego holdu > 1 s, czarnej pierwszej klatki. Technicznie: `filter: blur`/`backdrop-filter` w headless = 6× wolniej; CDP `captureScreenshot{optimizeForSpeed}` ~2× szybciej niż `page.screenshot`. Kod: `rejected/agent-inbox-gsap/`. |
