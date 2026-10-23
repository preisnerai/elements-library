# SUMMARY — R&D: wstawki wideo robione kodem (1080x1920, 30 fps)

**Wynik w jednym zdaniu:** 5 iteracji, 5 różnych technik renderu, 15 ocenionych wersji; **żadna nie przekroczyła progu 8** (najlepsze 6.6/10 u surowego krytyka), ale wszystkie 5 pipeline'ów działa jedną komendą i jest sterowanych z `props.json`.

Szczegóły każdej iteracji: `LEDGER.md`; oceny wersja po wersji: `out/NNN-*/CRITIC.md`.

## Top 5 wideo (wg oceny krytyka)

| # | plik | metoda | ocena | co tam jest |
|---|---|---|---|---|
| 1 | `out/005-keycaps-week-three/v3.mp4` | Three.js 3D + DOM | 6.6 | 7 klawiszy-dni wciskanych po kolei, licznik 0/7 → 6/7 liczony z klawiszy, czerwona „wpadka" w środę |
| 2 | `out/002-zdzierak-skia/v3.mp4` | Python + skia | 6.6 | kalendarz-zdzierak, kartki dni zrywane z zaginaniem, pieczątka z sumą czasu (v2 też 6.6) |
| 3 | `out/005-keycaps-week-three/v2.mp4` | Three.js 3D + DOM | 6.4 | jw., wcześniejszy układ |
| 4 | `out/001-agent-inbox-gsap/v2.mp4` | HTML/GSAP + Playwright | 6.2 | licznik 142 → 9 + taśma maili wpadających do koszy |
| 5 | `out/003-editorial-kinetic-remotion/v3.mp4` | Remotion | 6.0 | styl Twoich referencji: transkrypt → AI zaznacza 3 frazy → lecą do karty notatki → wynik |

## Tabela metod

Czas renderu = pełny klip 6–7.5 s, 1080x1920, sandbox 4 CPU bez GPU. Każda metoda: `rejected/<slug>/render.sh [props.json] [out.mp4]`.

| metoda (`rejected/…`) | technika | najlepsza ocena (czyt./polish/oryg./użyt./powt.) | render | powtarzalność (co zmieniasz w `props.json`) |
|---|---|---|---|---|
| `keycaps-week-three` | Three.js (WebGL w headless Chromium) + typografia w DOM, cienie VSM | **6.6** (7/7/6/7/6) | 130 s (PCF) – 400 s (VSM) | etykiety i stan dni (ok/wpadka), teksty, kolory, tempo; liczba liczy się sama z obiektów |
| `zdzierak-skia` | Python + skia-python (raster), siatka `drawVertices` do zaginania papieru | **6.6** (7/7/6/7/6) | 60–75 s | data startu (dni tygodnia liczone), minuty na dzień, nagłówki, kolory, tempo zrywania |
| `agent-inbox-gsap` | HTML/CSS + GSAP, klatka-po-klatce przez Playwright/CDP | 6.2 (7/6/5/7/6) | 55 s (343 s z `filter: blur`) | maile, kategorie, liczby, kolory, teksty |
| `editorial-kinetic-remotion` | Remotion 4 (React, `interpolate` po klatkach) | 6.0 (7/6/4/7/6) | **40 s** | linie tekstu (`**pogrubienie**`), słowo-klucz, transkrypt z frazami `[[...]]`, wynik, timing |
| `marker-diagram-manim` | Manim CE (Cairo, wektor), „odręczne" ścieżki z szumem | 5.4 (6/5/5/6/5) | **17 s** | wejście, rdzeń, 2–4 wyjścia (ok/błąd), wynik, kolory |
| — Blender (bpy 5.2.3) | Cycles / EEVEE | nie użyty | 47 s / 75 s **na klatkę** | — |

## 3 metody polecane do produkcji

1. **Three.js + nakładka DOM (`keycaps-week-three`)**: najlepsza ocena (ex aequo) i najwyższa czytelność przy zerowym mikrotekście. Daje obiekty 3D w studyjnym świetle, jak w Twoich referencjach (mózg, chromowane logo), a tekst zostaje ostrym Interem w DOM. Liczba wynika z tego, co widać, i krytyk to docenił. Minusy: najwolniejszy render (2–7 min) i trzeba pilnować kadru (`setViewOffset`).
2. **Remotion (`editorial-kinetic-remotion`)**: najbliżej Twoich referencji (edytorska kinetyczna typografia, blur-in słów, ciemne karty, łączniki) i najszybszy pipeline webowy (40 s, ~1 MB). Komponenty React to gotowy system szablonów, a `npx remotion studio` daje podgląd na żywo. Niskie oceny wynikały z treści (kolejny payoff „odzyskany czas"), nie z narzędzia.
3. **Python + skia (`zdzierak-skia`)**: najwyższy polish w metaforach fizycznych (papier, cień, zaginanie, pieczątka, wahadło), pełna kontrola piksela, bez przeglądarki, ok. 1 min na klip. Dobre do wstawek „przedmiot z prawdziwego świata".

*(Manim: tylko do diagramów-explainerów. Renderuje najszybciej (17 s), ale wypadł najsłabiej.)*

## Co nie działa / czego unikać

- **Ten sam payoff w każdej wstawce.** Krytyk konsekwentnie karał „dużą liczbę / odzyskany czas" (oryginalność 4–6 we wszystkich 15 ocenach). Trzeba zmieniać typ treści, nie tylko styl.
- **Mockupy UI z wieloma wierszami i tekst jako tekstura** (transkrypt, podglądy maili): na telefonie to mikrotekst, który wygląda jak błąd. Minimum to ~44 px, najlepiej ≥ 56 px.
- **Największy element musi nieść główną informację.** W 002 wygrywała cyfra dnia, w 004 elipsa „AGENT AI", a nie wynik.
- **Martwy hold > 1.5 s** po puencie i **czarna pierwsza klatka** (wstawka wchodzi po cięciu).
- **Czerwień w dwóch znaczeniach naraz** (błąd i sukces w 004).
- **Estetyka „AI slop"** (szkło, neon, poświaty, limonka na czerni): krytyk ją wyłapał od razu („SaaS dashboard").
- **Blender w tym sandboksie**: bez GPU 47–75 s na klatkę, czyli 2.5–4 h na wstawkę.
- **`filter: blur` / `backdrop-filter` na pełnym kadrze w headless Chromium**: 6× wolniej. Pomaga CDP `captureScreenshot{optimizeForSpeed}`.
- **Ziarno losowane per klatka**: 34 MB na 6 s. Stałe ziarno daje 11 MB.
- **Manim**: `Write` na tekście pokazuje kontury glifów, a okrągłe końcówki kresek rysują „kropki" przed startem linii (naprawione klasą `Draw`).
- **Pinterest**: proxy sandboksa go blokuje, dlatego referencje trzeba wrzucać jako pliki.

## Uwagi do procesu

- Krytyk (sonnet, tylko contact sheet) dał średnio **5.8** (zakres 4.8–6.6). Próg 8 okazał się nieosiągalny w 2 poprawkach na pomysł. Poprawki działały (001: 5.6→6.2, 002: 6.2→6.6, 005: 5.8→6.6), ale oryginalność rzadko przekraczała 6. Jeśli chcesz więcej „OK", obniż próg do 7 albo dodaj własną ocenę 1 przejrzanego wideo na iterację.
- Od iteracji 003 krytyk dostawał opis estetyki z Twoich referencji jako zamówionej (oceniał wykonanie, nie wybór stylu). Od 002 obowiązuje Twoja reguła: tylko Inter Regular/Bold.
- Następny krok o największym potencjale: połączyć styl Remotion (typografia z referencji) z obiektem 3D z Three.js w jednej kompozycji i zmieniać typ treści w kolejnych odcinkach (proces, przed/po, cytat, lista, porównanie), zamiast kolejnego licznika.

## Uruchomienie od zera

```bash
npm install                      # gsap, playwright, remotion, three, @fontsource/*
sudo apt-get install -y libegl1 libpango1.0-dev pkg-config libcairo2-dev   # skia / manim
tools/setup-python.sh            # .venv: skia-python, pycairo, manim, fonttools
rejected/keycaps-week-three/render.sh my-props.json out/moja-wstawka.mp4
tools/review.sh out/moja-wstawka.mp4   # ffprobe + black/freeze detect + contact sheet + 3 klatki
```
