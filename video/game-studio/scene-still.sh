#!/usr/bin/env bash
# Izolowany podgląd JEDNEJ sceny (bundluje tylko tę scenę + wspólne komponenty).
# Użycie: video/game-studio/scene-still.sh S05 0.5 1.2 2.0   → out/game-studio/stills/S05_t<sek>.png  (+ S05_sheet.png)
# Czas = czas lokalny sceny (0 = początek sceny). Zmienna STILLS_DIR zmienia katalog wyjściowy.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"
ID="$1"; shift
BROWSER="${REMOTION_BROWSER:-$(ls -d ${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}/chromium_headless_shell-*/{chrome-linux/headless_shell,chrome-headless-shell-linux64/chrome-headless-shell} 2>/dev/null | tail -1 || true)}"
OUTDIR="${STILLS_DIR:-$ROOT/out/game-studio/stills}"; mkdir -p "$OUTDIR" "$HERE/src/dev"
ENTRY="$HERE/src/dev/_$ID.jsx"; BUNDLE="$(mktemp -d)"
cat > "$ENTRY" <<JSX
import React, { useEffect, useState } from 'react';
import { registerRoot, Composition, AbsoluteFill, useCurrentFrame, useVideoConfig, delayRender, continueRender } from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import S from '../../script.json';
import { Background } from '../components/Background';
import Scene from '../scenes/$ID';
const it = S.scenes.find((s) => s.id === '$ID');
const One = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  const [ready, setReady] = useState(false); const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['400', '700'].map((w) => document.fonts.load(w + ' 64px Inter', 'AĄĆĘŁŃÓŚŹŻ aąćęłńóśźż 0123456789'))).then(() => { setReady(true); continueRender(h); }); }, [h]);
  if (!ready) return null;
  return <AbsoluteFill style={{ fontFamily: 'Inter', color: '#0F0F10' }}><Background t={t} /><Scene t={t} dur={it.dur} say={it.say} /></AbsoluteFill>;
};
registerRoot(() => <Composition id="Scene" component={One} width={1080} height={1920} fps={30} durationInFrames={Math.round(it.dur * 30)} />);
JSX
cd "$ROOT" && npx remotion bundle "$ENTRY" --out-dir="$BUNDLE" --log=error >/dev/null
FILES=()
for s in "$@"; do f=$(awk -v s="$s" 'BEGIN{printf "%d", s*30}'); o="$OUTDIR/${ID}_t$s.png"
  npx remotion still "$BUNDLE" Scene "$o" --frame="$f" ${BROWSER:+--browser-executable="$BROWSER"} --log=error; FILES+=("$o"); done
rm -rf "$BUNDLE" "$ENTRY"
# arkusz: wszystkie klatki obok siebie (po 360 px szerokości) + znacznik czasu
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf; [ -f "$FONT" ] || FONT="$(fc-match -f '%{file}' monospace)"
IN=(); FC=""; i=0; for o in "${FILES[@]}"; do IN+=(-i "$o"); FC+="[$i]scale=360:-1,drawtext=fontfile=$FONT:text='$(basename "$o" .png)':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6[v$i];"; i=$((i+1)); done
if [ $i -gt 1 ]; then ST=""; for ((k=0;k<i;k++)); do ST+="[v$k]"; done; ffmpeg -hide_banner -loglevel error -y "${IN[@]}" -filter_complex "${FC}${ST}hstack=inputs=$i" "$OUTDIR/${ID}_sheet.png"; else cp "${FILES[0]}" "$OUTDIR/${ID}_sheet.png"; fi
echo "sheet: $OUTDIR/${ID}_sheet.png"
