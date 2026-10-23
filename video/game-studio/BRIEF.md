# Brief: „Claude jako studio gier" — pionowe wideo 1080x1920, 30 fps, ~56 s

## Kontekst
Wideo ilustruje skrypt lektora (podział i czasy w `script.json`; każda scena = fragment tekstu „say" i jej długość „dur").
Lektor będzie nagrany osobno — obraz ma prowadzić widza przez treść: kluczowe słowa na ekranie + bohater **Clawd** (pikselowy ludzik Claude Code), który WYKONUJE czynność z danego fragmentu.

## Styl (z referencji użytkownika — obejrzyj arkusze)
Referencje (obrazy, otwórz narzędziem Read):
- `/tmp/claude-0/-home-user-elements-library/538b56cd-6d2c-57bb-97cd-251ccb85a161/scratchpad/refs/ref4.png` i `ref4_dense.png` — GŁÓWNA: jasnoszare tło z siatką, słowa wchodzą pojedynczo z rozmycia, ogromne słowo-klucz (Bold), czarna belka z białym tekstem odsłaniana od lewej, ciemne karty UI z miękkim cieniem, chipy, przerywane łączniki, rozmyte czarne gwiazdy w rogach, pomarańczowy akcent.
- `ref2.png`, `ref2_dense.png` — edytorski układ, obiekty z cieniem, dynamiczne wejścia.
- `ref3.png` — diagram rysowany „markerem" (dla inspiracji łączników/strzałek).
- `ref1.png` — duży obiekt + słowo-klucz.
Wzorcowa scena w tym projekcie: `src/scenes/S01.jsx` (+ podgląd `out/game-studio/stills/S01_sheet.png`).

## Twarde zasady
1. **Jeden font: Inter, tylko 400 i 700.** Różnicuj rozmiarem i wagą. Bez innych krojów.
2. **Kolory:** tło/siatka z `Background` (rysowane globalnie — NIE rysuj tła w scenie), tusz `#0F0F10`, karty `#1B1B1D`, akcent = kolor Clawda `#D97757` (oszczędnie: 1 element na scenę). Kolory pixel-artu gier dowolne, ale bez neonów/poświat/szkła (zakaz „AI slop").
3. **Strefa bezpieczna:** cała treść w x 80–940, y 260–1420. Środek kolumny x = 510 (nie 540!). Dekoracje mogą wychodzić.
4. **Czytelność na telefonie:** tekst ≥ 44 px (lepiej ≥ 56), maks. 3 elementy tekstowe naraz, słowo-klucz ogromne (`Keyword`). Nic nie może na siebie nachodzić (sprawdzaj!).
5. **Rytm:** coś nowego co 0.3–0.6 s, żadnego zamrożonego kadru > 1 s (Clawd ma mikroruch sam z siebie, ale dodaj akcję). Pierwsze elementy wchodzą w 0.05–0.25 s.
6. **Clawd zawsze coś robi** zgodnie z tekstem (narzędzie w dłoni, skok, pozy rąk, patrzenie). Rozmiar `u` 7–14 (szerokość = 18u px).
7. **Bez cudzych logo.** GTA/Minecraft/OpenCode/Claude wolno napisać jako tekst; wizualnie tylko ogólne motywy (miasto, klocki), żadnych znaków towarowych.
8. Przejścia między scenami robi `SceneWrap` w `Video.jsx` (rozmycie wejścia 0–0.4 s i wyjścia od `dur`). Twoja scena: pełny stan od ~0.3 s do `dur + 0.3` (nie wygaszaj sama na końcu, chyba że to część choreografii wewnątrz sceny).

## Technika
- Plik sceny: `src/scenes/SXX.jsx`, `export default function SXX({ t, dur, say })` — `t` = czas lokalny sceny w sekundach. Zwracasz fragment z elementami pozycjonowanymi absolutnie (kadr 1080x1920).
- **Edytuj wyłącznie swoje pliki scen.** Nie zmieniaj `src/components/*`, `src/lib/*`, `script.json`, `Video.jsx`, `index.jsx`. Potrzebujesz nowego rekwizytu/siatki pixel-art/komponentu → zdefiniuj lokalnie w swoim pliku sceny.
- API (przeczytaj źródła): `src/lib/anim.jsx` (prog, easingi, blurIn/blurOut/popIn, pulse, typed), `src/lib/theme.jsx` (C, SAFE, fit/measure),
  `src/components/Text.jsx` (Words z markupem `**bold**`/`==akcent==` i auto-fit, Keyword, HighlightBox, Kicker),
  `src/components/UI.jsx` (Card, Chip, Connector, CodeLines), `src/components/Clawd.jsx` (Clawd + ARMS/HAND), `src/components/props.jsx` (TOOLS, HATS),
  `src/components/Pixel.jsx` (PixelArt/PixelGroup z siatek stringów), `src/components/GameScreen.jsx` (warianty gry: gray/color/snow/city/blocks/merged, `reveal`, `placed`), `src/components/Devices.jsx` (Phone/Tablet/Laptop/Gamepad).
- Podgląd: `video/game-studio/scene-still.sh SXX 0.3 1.0 2.0 ...` (czasy lokalne) → `out/game-studio/stills/SXX_sheet.png` (+ pojedyncze klatki `SXX_t<sek>.png` w pełnej rozdzielczości). Otwórz Read i oceniaj krytycznie: kolizje, rozmiary, strefa bezpieczna, czy Clawd czytelnie robi to, o czym mówi lektor. Iteruj aż będzie dobrze (cel: poziom referencji). Nie renderuj całego filmu.
- Pomiar tekstu działa dopiero po załadowaniu fontów — komponenty to obsługują; w scenie używaj `fit`/`measure` tylko w renderze.
