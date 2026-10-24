---
name: motion-video
description: Robienie pionowych filmów motion graphics (B-roll / explainer, 1080x1920, 30 fps) kodem w Remotion — styl edytorskiej kinetycznej typografii z postacią Clawd, która wykonuje czynności z tekstu lektora. Użyj, gdy użytkownik prosi o animowany film / wstawkę / B-roll do skryptu.
---

# Motion video kodem (Remotion) — playbook

Ten skill opisuje, jak powstał film `out/game-studio/game-studio.mp4` (56 s, 13 scen) i jak robić kolejne na tym samym poziomie.
Gotowy projekt-wzorzec: `video/game-studio/` — zacznij od skopiowania go, NIE od zera.

## Dlaczego to wychodzi dobrze (5 zasad, które robią 90% efektu)

1. **Wzorzec wizualny z referencji, zamieniony na liczby.** Nie „ładny styl", tylko reguły: jasnoszare tło `#ECECEC` z siatką 108 px, jeden font (Inter 400/700), jedno OGROMNE słowo-klucz na scenę, słowa wchodzą pojedynczo z rozmycia co ~0.09 s, czarna belka z białym tekstem odsłaniana od lewej, ciemne karty `#1B1B1D` z miękkim cieniem, przerywane łączniki, rozmyte czarne gwiazdy w rogach, jeden akcent `#D97757`.
2. **System klocków przed scenami.** Najpierw komponenty (tło, typografia, karty, chipy, łączniki, postać, rekwizyty, ekrany), potem sceny składane z klocków. Spójność bierze się z tego, że każda scena używa tych samych części.
3. **Jedna scena = jedno zdanie lektora.** Skrypt dzielony na sceny 2–7 s (~2.6 słowa/s). W każdej scenie: (opcjonalny) kicker + słowo-klucz + **postać robi to, o czym jest zdanie** + jedna linia tekstu na dole.
4. **Twarde liczby czytelności:** tekst ≥ 44 px (lepiej ≥ 56), maks. 3 elementy tekstowe naraz, treść w strefie bezpiecznej TikToka x 80–940 / y 260–1420 (środek kolumny x = 510, nie 540), coś nowego co 0.3–0.6 s, żaden kadr nie stoi > 1 s.
5. **Pętla podglądu na stopklatkach.** Każdą scenę ogląda się na 5–7 klatkach (pełna rozdzielczość + arkusz) i poprawia kolizje/rozmiary ZANIM zrobi się render całości. Pełny render tylko raz na końcu.

## Struktura projektu

```
video/game-studio/
  script.json              # fps, wymiary, kolory, sceny: { id, dur (s), say (tekst lektora) }
  BRIEF.md                 # zasady stylu i API dla osoby/agenta piszącego sceny
  render.sh                # render całości (Remotion → h264)
  scene-still.sh           # podgląd JEDNEJ sceny: stopklatki + arkusz (izolowany bundle)
  still.sh                 # stopklatki całego filmu w sekundach globalnych
  make-srt.py              # napisy SRT z script.json (czasy pod nagranie lektora)
  src/
    index.jsx / Root.jsx   # rejestracja kompozycji (czas = suma dur scen)
    Video.jsx              # sekwencer: tło globalne + sceny + przejścia przez rozmycie
    lib/anim.jsx           # prog, easingi, blurIn/blurOut/popIn, pulse, typed
    lib/theme.jsx          # kolory, SAFE, fit/measure (pomiar tekstu canvasem)
    components/            # Background, Text, UI, Clawd, Pixel, props, GameScreen, Devices
    scenes/S01..S13.jsx    # sceny; index.jsx = rejestr id → komponent
```

Scena to funkcja `export default function SXX({ t, dur, say })`, gdzie `t` = czas LOKALNY sceny w sekundach. Wszystko liczone deterministycznie z `t` (żadnych `Math.random()`/`Date.now()`), elementy pozycjonowane absolutnie w kadrze 1080x1920.

## Proces krok po kroku

1. **Referencje** (jeśli są): z każdego filmu zrób arkusz klatek i arkusz gęsty (4 fps z 6 s), np.
   `ffmpeg -i ref.mp4 -vf "fps=24/DUR,scale=240:-2,tile=6x4" -frames:v 1 ref.png` i `-ss 0 -t 6 -vf "fps=4,scale=240:-2,tile=6x4"`.
   Spisz reguły liczbowo (kolory, rozmiary, tempo wejść, rodzaje przejść). Policz tempo cięć: `select='gt(scene,0.3)'`.
2. **Skrypt → `script.json`:** policz słowa, czas sceny ≈ słowa / 2.6 s (+0.2–0.5 s na akcję wizualną). Zapisz `say` dosłownie.
3. **Storyboard w punktach** dla każdej sceny: co jest słowem-kluczem, co robi postać, w której sekundzie lektor mówi kluczowe słowo (wtedy ma się to pojawić na ekranie).
4. **Klocki** (jeśli kopiujesz `video/game-studio`, już są): sprawdź, czy domena filmu potrzebuje nowych „ekranów" (u nas: `GameScreen` z wariantami gra/śnieg/miasto/klocki, `Devices`). Dopisz je jako komponenty, nie w scenach.
5. **Scena wzorcowa** (S01) — zrób ją pierwszą, dopracuj na stopklatkach; pozostałe sceny kopiują jej układ i rytm.
6. **Kolejne sceny**: `video/game-studio/scene-still.sh S05 0.3 0.8 1.4 2.0 2.25` → obejrzyj `out/game-studio/stills/S05_sheet.png` i 2 klatki pełne → popraw → powtórz (min. 3 rundy).
7. **Recenzja** świeżym okiem (checklista niżej), poprawki.
8. **Render jeden raz**: `video/game-studio/render.sh out/game-studio/film.mp4` (~10 min na 56 s na 4 CPU).
9. **QA**: `ffprobe` (1080x1920, 30 fps, yuv420p), `freezedetect=n=0.0008:d=1` (puste = dobrze), arkusz 40 klatek z całości:
   `ffmpeg -i film.mp4 -vf "fps=40/DUR,scale=180:-2,tile=8x5" -frames:v 1 sheet.png`.
10. **SRT** pod lektora: `python3 video/game-studio/make-srt.py`.

## Przepisy na animacje (wartości, które działają)

- **Słowo z rozmycia** (`blurIn`): 0.42 s, `expoOut`; opacity 0→1 (×2.5, szybciej niż ruch), blur 16→0 px, translateY 26→0, scale 0.95→1. Słowa w linii co 0.09 s.
- **Słowo-klucz** (`Keyword`): Inter 700, auto-fit do szerokości 800 px (max ~190 px), letter-spacing −0.045 em, litery wyostrzają się po kolei co 0.035 s (blur 20→0, y 30→0).
- **Czarna belka** (`HighlightBox`): tło `scaleX` 0→1 od lewej w 0.42 s (`expoOut`), tekst odsłaniany `clip-path` z opóźnieniem 0.12 s.
- **Chip / pop**: skala 0.6→1 z `backOut(c=2.2)` w 0.45 s; karty: blur 12→0 + y 60→0 w 0.5 s.
- **Łącznik przerywany** (`Connector`): ścieżka Béziera z `strokeDasharray`, „rysowanie" przez maskę z `pathLength=1` i `strokeDashoffset 1→0`.
- **Przejście między scenami** (`SceneWrap` w `Video.jsx`): sceny zachodzą na siebie 0.3 s; wejście: blur 22→0 + scale 0.97→1 (0.4 s), wyjście od `dur`: blur 0→26 + scale 1→1.05 + opacity→0. Jednocześnie w tle impuls: rozmyte gwiazdy wjeżdżają i obracają się mocniej (`kick`).
- **Licznik/maszynopis**: `typed(text, t, at, cps=22)`; liczby z `tabular-nums`.
- **Postać „żyje"** sama: skokowe oddychanie co ~0.45 s, mruganie co ~2.9 s, przebieranie nóg przy `walk`. Akcje dodawaj `lift` (skok), `squash` (zgniecenie przy lądowaniu), `arms`, `look`, `hold` (narzędzie), `hat`.

## Postać Clawd (jak powstała)

Z ASCII-artu z ekranu startowego Claude Code:
```
 ▐▛███▜▌
▝▜█████▛▘
  ▘▘ ▝▝
```
Każda ćwiartka znaku blokowego = jeden piksel o proporcjach 1×2 (wysoki), bo komórka terminala jest 2× wyższa niż szersza. Daje to siatkę 18×5 „ćwiartek": ciało kolumny 3–14 w wierszach 0–3, oczy (5,1) i (12,1), ręce w wierszu 2 (kol. 1–2 i 15–16), nogi w wierszu 4 (kol. 4, 6, 11, 13). Rysowane jako prostokąty SVG z `shape-rendering="crispEdges"`, kolor `#D97757`, oczy prawie czarne. Pozy rąk to inne zestawy pikseli (`down/up/leftUp/rightUp/reach`), narzędzia i czapki to małe siatki pixel-art (`components/props.jsx`) doczepiane do punktu dłoni.
Ta sama metoda działa dla dowolnej postaci: narysuj ją jako siatkę stringów (`'..##..'`) i renderuj `PixelArt`.

## Checklista przed renderem (recenzja)

- [ ] Nic na siebie nie nachodzi (karty, chipy, postać, tekst) — sprawdź klatki w pełnej rozdzielczości.
- [ ] Najważniejsza informacja sceny jest NAJWIĘKSZYM elementem.
- [ ] Tekst ≥ 44 px, maks. 3 elementy tekstu naraz, wszystko w x 80–940 / y 260–1420.
- [ ] Obraz pokazuje to, co lektor mówi W TEJ CHWILI (słowo-klucz pojawia się, gdy pada).
- [ ] Postać wyraźnie wykonuje czynność z tekstu; rekwizyty znaczą to samo w całym filmie (np. wałek = grafika, młotek = backend).
- [ ] Kolor akcentu ma jedno znaczenie; brak neonów, poświat, szkła („AI slop").
- [ ] Brak cudzych logo (marki tylko jako tekst).
- [ ] Brak martwych momentów > 1 s; pierwsza klatka nie jest pusta.

## Pułapki techniczne (wszystkie już rozwiązane w projekcie)

- Root `package.json` ma `"type": "module"` → webpack wymaga rozszerzeń w importach z plików `.js`; dlatego moduły projektu mają rozszerzenie `.jsx`.
- Fonty: `@fontsource/inter` 400/700 + `delayRender` do czasu `document.fonts.load(...)` z próbką polskich znaków; pomiar tekstu (`fit`) dopiero po załadowaniu.
- Linie tekstu bez zawijania (`white-space: nowrap`) + auto-fit rozmiaru, inaczej słowo potrafi spaść pod spód i nachodzić na słowo-klucz.
- Render: `--browser-executable` z Chromium Playwrighta (bez pobierania), `--image-format=png` (jpeg daje yuvj420p i artefakty), `--pixel-format=yuv420p --crf=18`.
- `filter: blur()` na całym kadrze jest drogie w renderze — używaj go tylko w przejściach i wejściach, nie stale.
- Podgląd scen w izolacji (`scene-still.sh` generuje osobny entry z jedną sceną) — błąd w innej scenie nie blokuje pracy nad Twoją.

## Koszt (ważne)

Najdroższe w tym filmie było budowanie klocków i 9 równoległych agentów. Kolejne filmy rób **w jednym wątku**: kopiujesz `video/game-studio`, podmieniasz `script.json`, piszesz sceny z gotowych komponentów, oglądasz stopklatki, jeden render. Agentów równoległych używaj tylko, gdy scen jest naprawdę dużo i jest na to budżet.

## Prompt startowy dla nowego filmu

> Użyj skilla motion-video i projektu `video/game-studio` jako szablonu (skopiuj do `video/<nazwa>`). Nowy skrypt lektora: „…". Rozpisz go w `script.json` na sceny (~2.6 słowa/s), zrób storyboard w punktach, potem sceny z istniejących komponentów — w każdej Clawd robi to, o czym mówię. Sprawdzaj każdą scenę przez `scene-still.sh`, przejdź checklistę, zrób jeden render i SRT. Pracuj w jednym wątku, bez agentów.
