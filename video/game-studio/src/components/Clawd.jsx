// Clawd — ludzik Claude Code, odtworzony z ASCII-artu z ekranu startowego:
//    ▐▛███▜▌      każda ćwiartka znaku = piksel 1×2 (wysoki), stąd 18×5 „ćwiartek"
//   ▝▜█████▛▘     ciało: kolumny 3–14, wiersze 0–3; oczy (5,1) i (12,1); ręce w wierszu 2; 4 nogi w wierszu 4
//     ▘▘ ▝▝
// Układ jednostek: 1 jednostka = szerokość ćwiartki; ćwiartka ma 1×2 jednostki. Clawd: 18×10 jednostek.
import React from 'react';
import { C } from '../lib/theme';
import { PixelGroup } from './Pixel';

const BODY_ROWS = [[3, 14], [3, 14], [3, 14], [3, 14]];
export const ARMS = {
  down: [[1, 2], [2, 2], [15, 2], [16, 2]],
  up: [[1, 0], [1, 1], [2, 1], [15, 1], [16, 1], [16, 0]],
  leftUp: [[1, 0], [1, 1], [2, 1], [15, 2], [16, 2]],
  rightUp: [[1, 2], [2, 2], [15, 1], [16, 1], [16, 0]],
  reach: [[1, 2], [2, 2], [15, 2], [16, 2], [17, 2]],
  none: [],
};
// prawa dłoń (punkt zaczepienia narzędzia) w jednostkach, dla każdej pozy rąk
export const HAND = { down: [17, 5], up: [17, 0.5], leftUp: [17, 5], rightUp: [17, 0.5], reach: [18, 5], none: [16, 5] };

/**
 * Clawd
 * x, y   — punkt na ekranie (px): środek DOLNEJ krawędzi stóp
 * u      — px na jednostkę (szerokość Clawda = 18u)
 * t      — czas sceny w sekundach (do animacji kroków/mrugania)
 * arms   — 'down' | 'up' | 'leftUp' | 'rightUp' | 'reach' | 'none'
 * walk   — przebieranie nogami; bob — skokowe „oddychanie"; look — -1/0/1 (oczy w lewo/prawo)
 * lift   — uniesienie (jednostki, np. do skoku); squash — -0.3..0.3 (zgniecenie/rozciągnięcie)
 * hold   — { grid, palette, dx, dy, rot, px } narzędzie w prawej dłoni (px = rozmiar piksela w jednostkach)
 * hat    — { grid, palette, dx, dy, px } coś na głowie
 * flip   — lustrzane odbicie; color — kolor ciała
 */
export const Clawd = ({ x, y, u = 12, t = 0, arms = 'down', walk = false, bob = true, look = 0, blink = true, lift = 0, squash = 0,
  flip = false, hold = null, hat = null, color = C.accent, eyeColor = C.eye, opacity = 1, style = {}, rot = 0 }) => {
  const VB = { x: -10, y: -14, w: 38, h: 26 };
  const step = Math.floor(t * 5) % 2;
  const by = bob ? (walk ? (step ? -0.6 : 0) : (Math.floor(t * 2.2) % 2 ? -0.35 : 0)) : 0;
  const blinkOn = blink && (t % 2.9) > 2.74;
  const ex = look < 0 ? -1 : look > 0 ? 1 : 0;
  const legs = [4, 6, 11, 13];
  const lifted = (c) => walk && (step ? c === 6 || c === 13 : c === 4 || c === 11);
  const armCells = ARMS[arms] || ARMS.down;
  const [hx, hy] = HAND[arms] || HAND.down;
  return (
    <svg width={VB.w * u} height={VB.h * u} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} shapeRendering="crispEdges"
      style={{ position: 'absolute', left: x - (9 - VB.x) * u, top: y - (10 - VB.y) * u, overflow: 'visible', opacity, transform: `${flip ? 'scaleX(-1)' : ''} rotate(${rot}deg)`, transformOrigin: `${(9 - VB.x) * u}px ${(10 - VB.y) * u}px`, ...style }}>
      <g transform={`translate(0 ${by - lift}) translate(9 10) scale(${1 + squash} ${1 - squash}) translate(-9 -10)`}>
        {hat && <PixelGroup grid={hat.grid} palette={hat.palette} px={hat.px ?? 1} py={hat.px ?? 1} x={hat.dx ?? 3} y={hat.dy ?? -(hat.grid.length * (hat.px ?? 1))} />}
        {BODY_ROWS.map(([a, b], r) => <rect key={r} x={a} y={r * 2} width={b - a + 1} height={2.02} fill={color} />)}
        {armCells.map(([c, r], i) => <rect key={'a' + i} x={c} y={r * 2} width={1.02} height={2.02} fill={color} />)}
        {legs.map((c) => <rect key={'l' + c} x={c} y={8} width={1} height={lifted(c) ? 1 : 2} fill={color} />)}
        {[5, 12].map((c) => <rect key={'e' + c} x={c + ex} y={blinkOn ? 3.4 : 2} width={1} height={blinkOn ? 0.6 : 2} fill={eyeColor} />)}
        {hold && <g transform={`translate(${hx + (hold.dx ?? 0)} ${hy + (hold.dy ?? 0)}) rotate(${hold.rot ?? 0})`}>
          <PixelGroup grid={hold.grid} palette={hold.palette} px={hold.px ?? 1} py={hold.px ?? 1} x={-(hold.ax ?? 0) * (hold.px ?? 1)} y={-(hold.ay ?? 0) * (hold.px ?? 1)} />
        </g>}
      </g>
    </svg>
  );
};
