// S05 — „drugi robi od nowa grafikę,"
// SKILL 02 / GRAFIKA: Clawd pcha wielki wałek po karcie z grą — za wałkiem szary szkic zamienia się w kolor.
import React from 'react';
import { Kicker, Keyword, Words, keywordSize } from '../components/Text';
import { Card } from '../components/UI';
import { GameScreen } from '../components/GameScreen';
import { Clawd } from '../components/Clawd';
import { PixelArt } from '../components/Pixel';
import { C } from '../lib/theme';
import { prog, clamp, backOut, pulse, blurIn, cubicOut } from '../lib/anim';

const SPARK = { grid: ['..#..', '..#..', '##.##', '..#..', '..#..'], palette: { '#': '#1B1B1D' } };

// karta (te same wymiary co płaska karta w S04 — ciągłość)
const CX = 220, CW = 580, GH = 348, CY = 572;           // gra: x 220–800, y 630–978
const GTOP = CY + 58, GBOT = CY + 58 + GH;

// wielki wałek malarski: pionowy cylinder na linii przejścia + rączka do dłoni Clawda
const Roller = ({ lx, hx, hy, t, dy = 0, spin = 0 }) => {
  const top = GTOP - 12 + dy, bot = GBOT + 12 + dy, w = 52;
  const stripes = [0, 1, 2, 3].map((k) => ((spin * 60 + k * 14) % 56) - 1);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} shapeRendering="crispEdges">
      {/* rączka: dłoń → kolano ramki → oś wałka */}
      <path d={`M${hx} ${hy} L${lx + 26} ${bot + 34} L${lx + 26} ${bot + 10} L${lx} ${bot + 10}`} fill="none" stroke="#2B2B2E" strokeWidth={9} strokeLinejoin="miter" shapeRendering="auto" />
      <line x1={hx} y1={hy} x2={hx + (lx + 26 - hx) * 0.55} y2={hy + (bot + 34 - hy) * 0.55} stroke="#2B2B2E" strokeWidth={16} strokeLinecap="round" shapeRendering="auto" />
      {/* cylinder */}
      <rect x={lx - w / 2} y={top} width={w} height={bot - top} rx={8} fill="#3E7BFA" shapeRendering="auto" />
      <rect x={lx - w / 2 + 4} y={top} width={6} height={bot - top} fill="#6E9DFF" opacity={0.9} />
      {stripes.map((s, k) => s > -1 && s < w - 4 ? <rect key={k} x={lx - w / 2 + s} y={top + 6} width={4} height={bot - top - 12} fill="#2F63D1" opacity={0.55} /> : null)}
      <rect x={lx - w / 2 - 4} y={top - 6} width={w + 8} height={10} rx={3} fill="#2B2B2E" shapeRendering="auto" />
      <rect x={lx - w / 2 - 4} y={bot - 4} width={w + 8} height={10} rx={3} fill="#2B2B2E" shapeRendering="auto" />
    </svg>
  );
};

export default function S05({ t }) {
  const KW = keywordSize('MECHANIKA', 170, 820);

  // przejście szkic → kolor: start już przy wejściu sceny, koniec ~1.6 s
  const p = prog(t, 0.06, 1.52);
  const r = 1 - Math.pow(1 - p, 1.5);
  const lx = CX + CW * r + 90 * cubicOut(prog(t, 1.58, 0.35));   // po skończeniu wałek odjeżdża z karty
  const done = p >= 1;

  // Clawd pcha wałek od lewej; po skończeniu podskakuje i unosi wałek
  const u = 11, feet = 1192;
  const hop = pulse(t, 1.66, 0.36) * 2.6;
  const cx = lx - 104;
  const hx = cx + 9 * u, hy = feet - 5 * u - hop * u;
  const look = done ? (t > 2.02 ? 0 : -1) : 1;

  return (
    <>
      <Kicker t={t} at={0.05} text="SKILL 02" y={268} size={44} />
      <Keyword t={t} at={0.12} text="GRAFIKA" y={334} max={KW} />

      <Card t={t} at={0.08} x={CX} y={CY} w={CW} h={GH + 58} title="ulubiona-gra">
        <GameScreen variant="color" t={t} w={CW} h={GH} reveal={r} />
      </Card>

      {/* iskierki „nowe" po skończeniu malowania */}
      {[[CX - 46, CY - 30, 1.66], [CX + CW + 36, CY - 24, 1.84], [CX - 52, GBOT - 70, 2.02]].map(([x, y, at], i) => {
        const k = prog(t, at, 0.5), s = backOut(prog(t, at, 0.28), 2.6) * (1 - 0.35 * k);
        return t > at ? (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: 50, height: 50, transform: `scale(${s}) rotate(${k * 45}deg)`, opacity: clamp((1.2 - k) * 2) }}>
            <PixelArt grid={SPARK.grid} palette={SPARK.palette} unit={10} />
          </div>
        ) : null;
      })}

      <div style={{ position: 'absolute', inset: 0, ...blurIn(t, 0.06, { dist: 30 }) }}>
      <Roller lx={lx} hx={hx} hy={hy} t={t} dy={-hop * u * 0.9} spin={r * 6} />
      <Clawd x={cx} y={feet} u={u} t={t} walk={!done} arms="reach" look={look} lift={hop} squash={pulse(t, 2.02, 0.18) * 0.16} />
      </div>

      <Words t={t} at={0.72} text="robi **od** **nowa** grafikę" size={60} y={1290} />
    </>
  );
}
