// S03 — „Każdy z nich ma osobne zadanie."
// Cztery osobne tory (jasne karty) — w każdym jeden Clawd robi JEDNĄ rzecz:
// mechanika (lupa, gra rozbierana na części) · grafika (pędzel, szkic → kolor) · backend (klucz, serwery) · kontroler (wtyczka, pad → telefon).
import React from 'react';
import { Words, Keyword } from '../components/Text';
import { Card, Connector } from '../components/UI';
import { GameScreen } from '../components/GameScreen';
import { Clawd } from '../components/Clawd';
import { TOOLS } from '../components/props';
import { PixelArt } from '../components/Pixel';
import { Gamepad, Phone } from '../components/Devices';
import { C } from '../lib/theme';
import { prog, backOut, expoOut, popIn, pulse, clamp, lerp } from '../lib/anim';

const LANE = { x: 100, w: 820, h: 186, y0: 520, step: 212 };
const STARTS = [0.12, 0.24, 0.36, 0.48];

const SPR = {
  hero: { grid: ['.bbb.', 'bbwbb', 'bbbbb', 'b...b'], palette: { b: '#3E7BFA', w: '#FFFFFF' } },
  coin: { grid: ['.yyy.', 'yyoyy', 'yyoyy', '.yyy.'], palette: { y: '#F6C343', o: '#D9A21E' } },
  enemy: { grid: ['.ggg.', 'gkgkg', 'ggggg', 'g.g.g'], palette: { g: '#8BD15A', k: '#1B1B1D' } },
  cloud: { grid: ['...cccc...', '..cccccc..', '.ccccccccc', 'cccccccccc', '.cccccccc.'], palette: { c: '#5AA9E6' } },
};
const rack = (on) => ({ grid: ['kkkkkk', 'kGkLLk', 'kkkkkk', 'kHkLLk', 'kkkkkk', 'kIkLLk', 'kkkkkk', 'k....k'],
  palette: { k: '#2B2B2E', L: '#55555A', G: on[0] ? '#5BC46A' : '#2F4A35', H: on[1] ? '#5BC46A' : '#2F4A35', I: on[2] ? '#F6C343' : '#4A4130' } });
const WRENCH = { grid: ['#...#', '##.##', '.###.', '..#..', '..#..', '..#..'], palette: { '#': '#3A3A3F' }, px: 1.3, ax: 2, ay: 6, rot: 26 };
const PLUG = { grid: ['.###..', '#####=', '#####.', '#####=', '.###..'], palette: { '#': '#1B1B1D', '=': '#9C9CA3' }, px: 1.2, ax: 0, ay: 2, rot: 0 };
const SWATCH = ['#3E7BFA', '#F6C343', '#5BC46A', '#E3473E'];

// ekran gry w ciemnej ramce (lokalnie w torze)
const Screen = ({ t, x, y, reveal = null }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 240, height: 150, borderRadius: 18, background: C.card, padding: 8, boxSizing: 'border-box', boxShadow: '0 10px 22px rgba(0,0,0,.18)' }}>
    <div style={{ width: 224, height: 134, borderRadius: 11, overflow: 'hidden' }}><GameScreen variant="color" t={t} w={224} h={134} reveal={reveal} /></div>
  </div>
);
const Tile = ({ t, at, x, y, s = 64, children, fx = 0, fy = 0 }) => {
  const p = prog(t, at, 0.42), e = expoOut(p);
  return (
    <div style={{ position: 'absolute', left: lerp(fx, x, e), top: lerp(fy, y, e), width: s, height: s, borderRadius: 16, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 10px 20px rgba(0,0,0,.18)', ...popIn(t, at, { dur: 0.42, from: 0.3 }) }}>{children}</div>
  );
};

// Clawd w torze: zeskakuje na miejsce i pracuje narzędziem
// spójne z S05 (wałek) i S06 (młotek + baza danych)
const HAMMER3 = { grid: ['hhhhhh', 'hhhhhh', '..ww..', '..ww..', '..ww..'], palette: { h: '#3A3A3E', w: '#A86B3C' }, px: 1.1, ax: 3, ay: 4.5 };
const DB = { grid: ['.kkkk.', 'kLLLLk', 'kkkkkk', 'kGkkkk', 'kkkkkk', 'kGkkkk', '.kkkk.'], palette: { k: '#1B1B1D', L: '#2E2E31', G: '#5BC46A' } };
const Worker = ({ t, at, tool, rotAmp = 14, speed = 11, done = 9 }) => {
  const d = prog(t, at, 0.3);
  const lift = d < 1 ? (1 - backOut(d, 1.4)) * 7 : 0;
  const hop = pulse(t, done, 0.3);
  const rot = (tool.rot || 0) + Math.sin(t * speed) * rotAmp;
  return <Clawd x={125} y={162} u={8} t={t} lift={lift + hop * 3} squash={pulse(t, at + 0.26, 0.2) * 0.2 - hop * 0.06} look={1}
    arms={hop > 0.2 ? 'leftUp' : 'down'} hold={{ ...tool, rot }} opacity={clamp(d * 5)} />;
};

const Lane = ({ t, i, children }) => (
  <Card t={t} at={STARTS[i]} x={LANE.x} y={LANE.y0 + i * LANE.step} w={LANE.w} h={LANE.h} header={false} light radius={30}
    style={{ boxShadow: '0 22px 44px rgba(0,0,0,.13), 0 5px 12px rgba(0,0,0,.08)' }}>
    {children}
  </Card>
);

export default function S03({ t }) {
  const [a, b, c, d] = STARTS;
  // mechanika: ramka „lupy" skacze po elementach gry
  const scanPts = [[282, 76], [352, 52], [414, 84]];
  const sk = Math.floor(Math.max(0, t - a - 0.45) / 0.32) % 3;
  const scanOn = t > a + 0.45;
  // backend: diody
  const led = (r, j) => (Math.floor(t * 7 + r * 1.7 + j * 2.3) % 3) !== 0;
  return (
    <>
      <Words t={t} at={0.05} text="Każdy z nich ma" size={62} y={284} />
      <Keyword t={t} at={0.5} text="OSOBNE ZADANIE" y={366} max={130} letterStep={0.025} />

      {/* 1 — mechanika: lupa + gra rozbierana na części */}
      <Lane t={t} i={0}>
        <Screen t={t} x={250} y={18} />
        {scanOn && <div style={{ position: 'absolute', left: scanPts[sk][0] - 4, top: scanPts[sk][1] - 4, width: 64, height: 64, border: '4px dashed #FFFFFF', borderRadius: 10, boxSizing: 'border-box' }} />}
        {[['hero', 0], ['coin', 1], ['enemy', 2]].map(([k, j]) => (
          <Tile key={k} t={t} at={a + 0.62 + j * 0.16} x={540 + j * 84} y={61} fx={370} fy={61}>
            <PixelArt grid={SPR[k].grid} palette={SPR[k].palette} unit={8} />
          </Tile>
        ))}
        <Worker t={t} at={a + 0.12} tool={{ ...TOOLS.magnifier, px: 1.05 }} rotAmp={10} speed={7} done={1.75} />
      </Lane>

      {/* 2 — grafika: pędzel + szkic → kolor */}
      <Lane t={t} i={1}>
        <Screen t={t} x={250} y={18} reveal={prog(t, b + 0.4, 1.2)} />
        {SWATCH.map((col, j) => (
          <div key={col} style={{ position: 'absolute', left: 592 + (j % 2) * 62, top: 33 + Math.floor(j / 2) * 62, width: 54, height: 54, borderRadius: 10, background: col,
            boxShadow: '0 6px 12px rgba(0,0,0,.14)', ...popIn(t, b + 0.5 + j * 0.1, { dur: 0.4, from: 0.2 }) }} />
        ))}
        <Worker t={t} at={b + 0.12} tool={{ ...TOOLS.roller, px: 1.3, rot: 0 }} rotAmp={6} speed={16} done={1.85} />
      </Lane>

      {/* 3 — backend: klucz + szafy serwerowe → chmura */}
      <Lane t={t} i={2}>
        {[0, 1, 2].map((r) => {
          const R = rack([led(r, 0), led(r, 1), led(r, 2)]);
          return <div key={r} style={{ position: 'absolute', left: 254 + r * 98, top: 30, ...popIn(t, c + 0.18 + r * 0.08, { dur: 0.4, from: 0.3 }) }}><PixelArt grid={R.grid} palette={R.palette} unit={15} /></div>;
        })}
        {t > c + 0.6 && <Connector t={t} at={c + 0.62} dur={0.3} x1={548} y1={90} x2={630} y2={90} bend={-14} width={5} />}
        <div style={{ position: 'absolute', left: 640, top: 58, ...popIn(t, c + 0.85, { dur: 0.4, from: 0.3 }) }}>
          <PixelArt grid={DB.grid} palette={DB.palette} unit={12} />
        </div>
        <Worker t={t} at={c + 0.12} tool={HAMMER3} rotAmp={10} speed={13} done={1.95} />
      </Lane>

      {/* 4 — kontroler: wtyczka → pad → telefon */}
      <Lane t={t} i={3}>
        {t > d + 0.45 && <Connector t={t} at={d + 0.48} dur={0.3} x1={256} y1={128} x2={340} y2={104} bend={-14} width={5} />}
        <div style={{ position: 'absolute', inset: 0, ...popIn(t, d + 0.2, { dur: 0.42, from: 0.4 }), transformOrigin: '432px 93px' }}>
          <Gamepad x={432} y={93} s={0.62} />
          {/* wciskany przycisk */}
          {t > d + 0.8 && <div style={{ position: 'absolute', left: 432 + (222 - 150) * 0.62 - 12, top: 93 + (78 - 95) * 0.62 - 12, width: 24, height: 24, borderRadius: 12,
            border: `4px solid ${C.ink}`, boxSizing: 'border-box', opacity: 1 - prog((t - d - 0.8) % 0.4, 0, 0.4), transform: `scale(${1 + 0.9 * prog((t - d - 0.8) % 0.4, 0, 0.4)})` }} />}
        </div>
        {t > d + 0.75 && <Connector t={t} at={d + 0.78} dur={0.3} x1={532} y1={93} x2={684} y2={93} bend={18} width={5} />}
        <div style={{ position: 'absolute', inset: 0, ...popIn(t, d + 0.98, { dur: 0.42, from: 0.4 }), transformOrigin: '728px 93px' }}>
          <Phone x={690} y={18} s={0.33} t={t} />
        </div>
        <Worker t={t} at={d + 0.12} tool={PLUG} rotAmp={4} speed={9} done={2.05} />
      </Lane>
    </>
  );
}
