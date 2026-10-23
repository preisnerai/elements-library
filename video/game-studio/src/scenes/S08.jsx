// S08 — „Najciekawszy jest skill od modów."
// Kulminacja: małe „Najciekawszy jest skill od" + GIGANTYCZNE „MODÓW" z pomarańczową belką (jedyny akcent w kadrze poza Clawdem).
// Clawd podskakuje z ekscytacji, przysiada i wybija się wysoko z rękami w górze — przy szczycie wybucha deszcz pikselowych iskier;
// drugi podskok = druga salwa, potem macha rękami. Pod nim cień, który maleje przy skoku.
import React from 'react';
import { Words, Keyword, keywordSize, measure } from '../components/Text';
import { Clawd } from '../components/Clawd';
import { PixelArt } from '../components/Pixel';
import { C } from '../lib/theme';
import { prog, clamp, expoOut, cubicOut, pulse, popIn } from '../lib/anim';

const X = 510, F = 1185, U = 14, JUMP = 8;
const WORDS_Y = 492, KW_Y = 606;

const BIG = ['...#...', '...#...', '..###..', '#######', '..###..', '...#...', '...#...'];
const PLUS = ['.#.', '###', '.#.'];
const DOT = ['##', '##'];
const SHAPES = [BIG, PLUS, BIG, DOT, PLUS, BIG, DOT, PLUS, BIG, PLUS, DOT, BIG];
const COLS = [C.ink, '#F6C343', '#3E7BFA', C.ink, '#5BC46A', C.ink, '#F6C343', C.ink, '#3E7BFA', '#5BC46A', C.ink, '#F6C343'];

// salwa iskier: n cząstek rozlatuje się łukiem w górę i na boki, potem opada i miga, gaśnie
const Burst = ({ t, at, ox, oy, n = 12, reach = 1, seed = 0 }) => {
  const p = prog(t, at, 0.75);
  if (p <= 0 || p >= 1) return null;
  return Array.from({ length: n }).map((_, i) => {
    const a = (-200 + (220 * i) / (n - 1) + ((i * 37 + seed * 13) % 11) - 5) * (Math.PI / 180);
    const side = Math.abs(Math.cos(a));                     // boczne lecą dalej, pionowe krócej (nie wchodzą na napis)
    const d = (120 + 180 * side + ((i * 53 + seed * 29) % 40)) * reach;
    const e = expoOut(p * 1.25);
    const x = ox + Math.cos(a) * d * e, y = oy + Math.sin(a) * d * e + 90 * p * p;
    const flick = p > 0.55 ? (Math.floor(t * 18 + i) % 2 ? 1 : 0) : 1;
    const g = SHAPES[(i + seed) % SHAPES.length], unit = g.length === 7 ? 7 : g.length === 3 ? 9 : 9;
    const sc = p < 0.12 ? p / 0.12 : 1 - Math.max(0, p - 0.7) / 0.3;
    return <PixelArt key={i} grid={g} palette={{ '#': COLS[(i + seed * 3) % COLS.length] }} unit={unit}
      style={{ position: 'absolute', left: x - (g[0].length * unit) / 2, top: y - (g.length * unit) / 2, opacity: flick * clamp(sc * 1.5), transform: `scale(${Math.max(0, sc).toFixed(3)})` }} />;
  });
};

// stałe migające gwiazdki wokół Clawda (po pierwszej salwie)
const TWINKLE = [[238, 1000, BIG, C.ink, 1.2], [790, 965, PLUS, '#3E7BFA', 1.3], [196, 1170, PLUS, '#F6C343', 1.4], [826, 1150, BIG, C.ink, 1.5]];

export default function S08({ t }) {
  const size = keywordSize('MODÓW', 250, 820);
  const kwW = measure('MODÓW', 700, size, -0.045);

  // ——— Clawd ———
  let lift = 1.3 * pulse(t, 0.12, 0.22) + 1.3 * pulse(t, 0.38, 0.22);      // dwa niecierpliwe podskoki
  let squash = 0.12 * pulse(t, 0.32, 0.08) + 0.1 * pulse(t, 0.58, 0.06);
  if (t > 0.62 && t < 0.84) squash += 0.26 * cubicOut(prog(t, 0.62, 0.18)); // przysiad
  if (t >= 0.84 && t < 1.14) lift += JUMP * cubicOut(prog(t, 0.84, 0.3));      // wybicie
  if (t >= 1.14 && t < 1.42) { const p = prog(t, 1.14, 0.28); lift += JUMP * (1 - p * p); }
  squash -= 0.16 * pulse(t, 0.84, 0.3);
  squash += 0.24 * pulse(t, 1.42, 0.18);                                     // lądowanie
  lift += 4.5 * pulse(t, 1.6, 0.32);                                         // drugi skok
  squash -= 0.1 * pulse(t, 1.6, 0.32);
  squash += 0.18 * pulse(t, 1.92, 0.16);
  lift += 1.4 * pulse(t, 2.1, 0.22);                                         // małe odbicie
  const wave = Math.floor(t * 7.5) % 2 ? 'leftUp' : 'rightUp';
  const arms = t < 0.62 ? wave : t < 0.84 ? 'down' : t < 1.98 ? 'up' : wave;
  const look = t < 0.62 ? (Math.floor(t * 5) % 2 ? -1 : 1) : 0;

  // ——— belka akcentu i „uderzenie" słowa ———
  const bar = expoOut(prog(t, 1.2, 0.38));
  const thump = 1 + 0.03 * pulse(t, 1.4, 0.26) + 0.015 * pulse(t, 1.74, 0.2);
  const shadowK = 1 - Math.min(1, lift / 10);

  return (
    <>
      <Words t={t} at={0.05} text="Najciekawszy jest skill od" size={64} y={WORDS_Y} step={0.1} />

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${thump.toFixed(4)})`, transformOrigin: `${X}px ${KW_Y + size * 0.5}px` }}>
        {/* pomarańczowa belka pod dolną połową liter (jak zakreślacz) */}
        <div style={{ position: 'absolute', left: X - kwW / 2 - size * 0.03, top: KW_Y + size * 0.52, width: (kwW + size * 0.06) * bar, height: size * 0.36, background: C.accent }} />
        <Keyword t={t} at={0.78} text="MODÓW" y={KW_Y} max={size} width={820} letterStep={0.07} />
      </div>

      {/* cień na ziemi */}
      <div style={{ position: 'absolute', left: X - 110 * shadowK, top: F - 10, width: 220 * shadowK, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,.16)', filter: 'blur(6px)', opacity: clamp(prog(t, 0.05, 0.2)) * (0.4 + 0.6 * shadowK) }} />

      {TWINKLE.map(([x, y, g, col, at], i) => {
        const s = popIn(t, at, { from: 0.2 });
        const tw = Math.floor(t * 6 + i * 1.7) % 3 ? 1 : 0;
        const unit = g.length === 7 ? 8 : 10;
        return <PixelArt key={i} grid={g} palette={{ '#': col }} unit={unit} style={{ position: 'absolute', left: x - (g[0].length * unit) / 2, top: y - (g.length * unit) / 2, opacity: s.opacity * tw, transform: s.transform }} />;
      })}

      <Burst t={t} at={1.08} ox={X} oy={F - 5 * U - JUMP * U} n={12} seed={0} />
      <Burst t={t} at={1.7} ox={X} oy={F - 5 * U - 4.5 * U} n={10} reach={0.85} seed={5} />

      <Clawd x={X} y={F} u={U} t={t} arms={arms} look={look} lift={lift} squash={squash}
        opacity={clamp(prog(t, 0.04, 0.12))} style={{ filter: `blur(${((1 - expoOut(prog(t, 0.04, 0.3))) * 10).toFixed(2)}px)` }} />
    </>
  );
}
