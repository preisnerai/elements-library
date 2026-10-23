// S02 — „To darmowy skill, a właściwie jedenaście skilli, które pracują razem."
// Jeden duży Clawd (skill za 0 zł) „pęka" na 11 małych Clawdów z różnymi narzędziami, które
// lądują na pierścieniu wokół wspólnej gry; przerywane łączniki spinają je w sieć, a gra się koloruje.
import React from 'react';
import { Words, Keyword, HighlightBox } from '../components/Text';
import { Card, Chip, Connector } from '../components/UI';
import { GameScreen } from '../components/GameScreen';
import { Clawd } from '../components/Clawd';
import { TOOLS } from '../components/props';
import { C } from '../lib/theme';
import { prog, backOut, expoOut, cubicOut, blurIn, blurOut, pulse, clamp, lerp } from '../lib/anim';

// lokalne rekwizyty pixel-art (ax/ay = punkt chwytu w pikselach siatki)
const P = {
  server: { grid: ['#####', '#g#ll', '#####', '#g#ll', '#####', '#g#ll', '#####'], palette: { '#': '#2B2B2E', g: '#5BC46A', l: '#6A6A70' }, px: 0.85, ax: 1, ay: 7 },
  pad: { grid: ['.#######.', '##w###r##', '#www#y#b#', '##w###g##', '###...###'], palette: { '#': '#1B1B1D', w: '#F2F2F2', r: '#E3473E', y: '#F6C343', b: '#3E7BFA', g: '#5BC46A' }, px: 0.75, ax: 1, ay: 5 },
  snow: { grid: ['...#...', '.#.#.#.', '..###..', '#######', '..###..', '.#.#.#.', '...#...'], palette: { '#': '#5AA9E6' }, px: 0.85, ax: 1, ay: 7 },
  shirt: { grid: ['##...##', '#######', '#######', '.#####.', '.#####.', '.#####.'], palette: { '#': '#3E7BFA' }, px: 0.85, ax: 1, ay: 6 },
  wrench: { grid: ['#...#', '##.##', '.###.', '..#..', '..#..', '..#..'], palette: { '#': '#3A3A3F' }, px: 1.0, ax: 2, ay: 6, rot: -25 },
  flag: { grid: ['#rrrr', '#rrrr', '#rrrr', '#....', '#....', '#....'], palette: { '#': '#2B2B2E', r: '#3E7BFA' }, px: 1.0, ax: 0, ay: 6 },
  map: { grid: ['yyyyyyy', 'y#yyyrr', 'yy#yyrr', 'yyy##yy', 'yyyyy#y'], palette: { y: '#F2DFA6', '#': '#7A4A2A', r: '#E3473E' }, px: 0.9, ax: 1, ay: 5 },
  // spójne z S04–S06: klucz (mechanika), młotek (backend), okrągła lupa
  wrench2: { grid: ['##.##', '##.##', '#####', '.###.', '..#..', '..#..', '..#..', '..#..', '.###.'], palette: { '#': '#2B2B2E' }, px: 0.8, ax: 2, ay: 8 },
  hammer: { grid: ['hhhhhh', 'hhhhhh', '..ww..', '..ww..', '..ww..', '..ww..', '..ww..'], palette: { h: '#3A3A3E', w: '#A86B3C' }, px: 0.95, ax: 3, ay: 6.5 },
  lupa: { grid: ['..###..', '.#...#.', '#.....#', '#.....#', '#.....#', '.#...#.', '..###..', '......#', '.......#'], palette: { '#': '#1B1B1D' }, px: 0.8, ax: 3, ay: 8 },
};
// kolor „paczki" niesionej przez danego Clawda do wspólnej gry
const ROLE_COLOR = ['#1B1B1D', '#3E7BFA', '#5BC46A', '#1B1B1D', '#5AA9E6', '#9FB3C8', '#3E7BFA', '#C9824E', '#A86B3C', '#2B2B2E', '#3E7BFA'];
// kolejność zgodnie z ruchem wskazówek zegara od góry (mechanika, grafika, backend, kontroler, mody…)
const ROLES = [P.lupa, TOOLS.roller, P.server, P.pad, P.snow, TOOLS.sword, P.shirt, P.map, P.hammer, P.wrench2, P.flag];

const HX = 510, HY = 975;          // środek pierścienia
const GY = 960;                    // środek karty wspólnej gry (lekko wyżej → dłuższe łączniki u dołu)
const RX = 310, RY = 255, U = 8;   // pierścień i rozmiar małych Clawdów
const SPLIT = 1.45;                // moment „pęknięcia" na 11
const HUB = 2.6;                   // „które pracują razem"

const ring = ROLES.map((role, k) => {
  const a = -Math.PI / 2 + (k * 2 * Math.PI) / 11;
  const x = HX + RX * Math.cos(a), y = HY + RY * Math.sin(a);
  // łącznik: od krawędzi Clawda do krawędzi karty gry
  const dx = HX - x, dy = GY - y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const tc = 1 / Math.hypot(ux / 76, uy / 56) - 6;
  const th = Math.min(150 / Math.abs(ux || 1e-6), 95 / Math.abs(uy || 1e-6)) - 2;
  return { role, k, x, y, flip: x < HX - 5, x1: x + ux * tc, y1: y + uy * tc, x2: HX - ux * th, y2: GY - uy * th };
});

// punkt na krzywej łącznika (ta sama geometria co Connector)
const qpt = (c, bend, p) => {
  const mx = (c.x1 + c.x2) / 2, my = (c.y1 + c.y2) / 2, dx = c.x2 - c.x1, dy = c.y2 - c.y1, L = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / L) * bend, cy = my + (dx / L) * bend, q = 1 - p;
  return [q * q * c.x1 + 2 * q * p * cx + p * p * c.x2, q * q * c.y1 + 2 * q * p * cy + p * p * c.y2];
};
const bendOf = (k) => (k % 2 ? 18 : -18);

export default function S02({ t }) {
  // --- duży Clawd: spada, cieszy się „za darmo", nabiera powietrza i pęka
  const drop = prog(t, 0.12, 0.32), land = pulse(t, 0.44, 0.24);
  const lift = drop < 1 ? (1 - backOut(drop, 1.2)) * 50 : 0;
  const cheer = pulse(t, 0.86, 0.32);
  const wind = prog(t, 1.12, SPLIT - 1.12);
  const shakeX = t > 1.12 && t < SPLIT ? (Math.floor(t * 30) % 2 ? -1 : 1) * 3 * wind : 0;
  const gone = prog(t, SPLIT, 0.12);
  const bigScale = 1 + 0.12 * wind + 0.25 * cubicOut(gone);   // pęka na zewnątrz
  const burst = prog(t, SPLIT, 0.55);

  // --- tekst górny znika przy „pracują razem", słowo-klucz podjeżdża
  const topOut = t > HUB ? blurOut(t, HUB) : {};
  const kwY = 418 - 58 * expoOut(prog(t, HUB + 0.05, 0.5));
  const hub = prog(t, HUB, 0.5);

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, ...topOut }}>
        <Words t={t} at={0.05} text="To **darmowy** skill," size={62} y={276} />
        <Words t={t} at={1.02} text="a właściwie" size={54} y={350} />
      </div>
      <Keyword t={t} at={SPLIT + 0.03} text="11 SKILLI" y={kwY} max={180} letterStep={0.045} />

      {/* cena 0 zł przy dużym Clawdzie */}
      {t < 1.6 && (
        <div style={{ position: 'absolute', inset: 0, ...(t > 1.18 ? blurOut(t, 1.18, { dur: 0.25 }) : {}) }}>
          <Connector t={t} at={0.5} dur={0.3} x1={672} y1={930} x2={736} y2={850} bend={-24} width={5} />
          <Chip t={t} at={0.58} x={736} y={770} text="0 zł" size={56} />
        </div>
      )}

      {/* duży Clawd */}
      {gone < 1 && (
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${shakeX}px) scale(${Math.max(0.001, bigScale)})`, transformOrigin: `${HX}px ${HY}px`, opacity: 1 - gone }}>
          <Clawd x={HX} y={HY + 80} u={14} t={t} lift={lift + cheer * 4} squash={land * 0.22 - (drop < 1 ? 0.08 : 0) + wind * 0.16}
            arms={cheer > 0.05 ? 'up' : wind > 0 ? 'down' : 'down'} look={t > 0.62 && t < 1.12 ? 1 : 0} opacity={clamp(drop * 5)} />
        </div>
      )}

      {/* „bum": promieniste kreski w chwili pęknięcia */}
      {t > SPLIT && t < SPLIT + 0.3 && (() => { const k = prog(t, SPLIT, 0.3); return (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - k }}>
          {Array.from({ length: 10 }).map((_, i) => { const a = (i / 10) * Math.PI * 2 + 0.3, r0 = 150 + k * 120, r1 = r0 + 60;
            return <line key={i} x1={HX + Math.cos(a) * r0} y1={HY + Math.sin(a) * r0 * 0.8} x2={HX + Math.cos(a) * r1} y2={HY + Math.sin(a) * r1 * 0.8} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />; })}
        </svg>); })()}
      {/* rozchodzący się przerywany pierścień w chwili „pęknięcia" */}
      {burst > 0 && burst < 1 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <ellipse cx={HX} cy={HY} rx={RX * expoOut(burst)} ry={RY * expoOut(burst)} fill="none" stroke={C.ink} strokeWidth={6}
            strokeDasharray="13 12" strokeLinecap="round" opacity={0.9 * (1 - burst)} />
        </svg>
      )}

      {/* wspólna gra w środku — powstaje z szarego szkicu, gdy wszyscy pracują */}
      {t > HUB - 0.05 && (
        <Card t={t} at={HUB} x={HX - 150} y={GY - 95} w={300} h={190} radius={26} header={false}>
          <GameScreen variant="color" t={t} w={300} h={190} reveal={cubicOut(prog(t, HUB + 0.45, 1.0))} />
        </Card>
      )}

      {/* łączniki Clawd → gra */}
      {ring.map((c) => t > HUB + 0.08 && (
        <Connector key={'c' + c.k} t={t} at={HUB + 0.1 + c.k * 0.03} dur={0.35} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} bend={bendOf(c.k)} width={5} dot={false} />
      ))}
      {/* „paczki" płynące po łącznikach do gry */}
      {t > HUB + 0.55 && ring.map((c) => {
        const p = ((t - HUB - 0.55) * 1.5 + c.k * 0.37) % 1;
        const [px, py] = qpt(c, bendOf(c.k), 0.14 + p * 0.8);
        const a = clamp((t - HUB - 0.55) * 4) * clamp(Math.min(p, 1 - p) * 8);
        return <div key={'p' + c.k} style={{ position: 'absolute', left: px - 6, top: py - 6, width: 12, height: 12, background: ROLE_COLOR[c.k], opacity: a }} />;
      })}

      {/* 11 małych Clawdów */}
      {ring.map((c) => {
        const s = SPLIT + 0.02 + c.k * 0.065;
        const p = prog(t, s, 0.42);
        if (p <= 0) return null;
        const e = expoOut(p);
        const u = U * (0.35 + 0.65 * backOut(p, 1.6));
        const cx = lerp(HX, c.x, e), cy = lerp(HY, c.y, e);
        const landed = p >= 1;
        const sq = pulse(t, s + 0.3, 0.24) * 0.22;
        // fala (po kolei) i wspólny podskok
        const wave = pulse(t, HUB + 0.55 + c.k * 0.05, 0.3);
        const sync = pulse(t, 3.92, 0.32) + pulse(t, 4.3, 0.3);
        const hop = Math.max(wave, sync);
        const work = t < HUB + 0.5 ? Math.sin(t * 10 + c.k * 1.7) * 6 : Math.sin(t * 12 + c.k * 0.9) * 5;
        const holdPop = backOut(prog(t, s + 0.28, 0.25), 2);
        const hold = holdPop > 0 ? { ...c.role, px: c.role.px * holdPop, rot: (c.role.rot || 0) + work } : null;
        const toHub = t > HUB ? Math.sign(Math.round(HX - c.x)) * (c.flip ? -1 : 1) : 0;
        return (
          <Clawd key={c.k} x={cx} y={cy + 5 * u} u={u} t={t + c.k * 0.37} flip={c.flip}
            arms={!landed ? 'up' : hop > 0.12 && c.y < HY + 100 ? 'leftUp' : 'down'} hold={landed || p > 0.7 ? hold : null}
            lift={hop * 2} squash={sq - hop * 0.08} look={toHub} opacity={clamp(p * 6)} />
        );
      })}

      <HighlightBox t={t} at={HUB + 0.15} text="pracują razem" size={62} y={1312} />
    </>
  );
}
