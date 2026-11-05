// S14 — „ChatGPT rozkłada całe drzewo przed Tobą w formie animacji."
// Eskalacja motywu: wachlarz przodków na 4 pokolenia (2/4/8/16) rozkłada się nad Clawdem, kamera odjeżdża.
import React from 'react';
import { Words, HighlightBox } from '../components/Text';
import { Clawd } from '../components/Clawd';
import { PixelArt } from '../components/Pixel';
import { FACES } from '../components/Family';
import { C } from '../lib/theme';
import { prog, expoOut, cubicInOut, backOut, clamp, lerp } from '../lib/anim';

const SZ = [0, 116, 90, 66, 44], YC = [0, 965, 830, 700, 580], AT = [0, 0.3, 0.6, 0.9, 1.2];
const FOUND = new Set(['2-3', '3-1', '3-6', '4-2', '4-9', '4-13']);
const node = (g, i) => { const n = 2 ** g, slot = 860 / n; return { x: 80 + slot * (i + 0.5), y: YC[g], s: SZ[g] }; };
const kinds = ['om', 'of', 'm', 'f'];

export default function S14({ t }) {
  const zoom = lerp(1.32, 1, cubicInOut(prog(t, 0.1, 2.0)));
  const nodes = [], edges = [];
  for (let g = 1; g <= 4; g++) for (let i = 0; i < 2 ** g; i++) nodes.push({ g, i, ...node(g, i) });
  for (let g = 0; g < 4; g++) for (let i = 0; i < 2 ** g; i++) {
    const c = g === 0 ? { x: 510, y: 1090, s: 0 } : node(g, i), p0 = node(g + 1, 2 * i), p1 = node(g + 1, 2 * i + 1);
    const top = c.y - c.s / 2, bot = p0.y + p0.s / 2, mid = (top + bot) / 2;
    edges.push({ g: g + 1, d: `M${c.x},${top} V${mid} M${p0.x},${mid} H${p1.x} M${p0.x},${mid} V${bot} M${p1.x},${mid} V${bot}` });
  }
  const jump = t > 1.7;
  return (
    <>
      <Words t={t} at={0.05} text="ChatGPT rozkłada **całe** **drzewo**" size={60} y={292} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '510px 1120px' }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          {edges.map((e, k) => <path key={k} d={e.d} pathLength={1} stroke={C.ink} strokeWidth={4} fill="none" strokeDasharray="1 1" strokeDashoffset={1 - expoOut(prog(t, AT[e.g] + 0.05, 0.35))} />)}
        </svg>
        {nodes.map((n) => {
          const p = prog(t, AT[n.g] + (n.i / 2 ** n.g) * 0.15, 0.4), f = FACES[kinds[(n.i + n.g) % 4]], found = FOUND.has(`${n.g}-${n.i}`);
          return (
            <div key={`${n.g}-${n.i}`} style={{ position: 'absolute', left: n.x - n.s / 2, top: n.y - n.s / 2, width: n.s, height: n.s, borderRadius: n.s * 0.2, background: C.card,
              outline: found ? `${Math.max(3, n.s * 0.05)}px solid ${C.accent}` : undefined, outlineOffset: Math.max(2, n.s * 0.04),
              opacity: clamp(p * 4), transform: `scale(${p > 0 ? 0.5 + 0.5 * backOut(p, 2) : 0.5})`, boxShadow: '0 10px 24px rgba(0,0,0,.2)' }}>
              <PixelArt grid={f.grid} palette={f.pal} unit={n.s / 13} style={{ position: 'absolute', left: n.s * 0.115, top: n.s * 0.17 }} />
            </div>
          );
        })}
        <Clawd x={510} y={1170} u={9} t={t} arms={jump ? 'up' : 'down'} lift={jump ? Math.abs(Math.sin((t - 1.7) * 8)) * 1.6 : 0} />
      </div>
      <HighlightBox t={t} at={2.0} text="w formie animacji" size={64} y={1250} />
    </>
  );
}
