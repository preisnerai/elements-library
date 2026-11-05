// S03 — „Pokażę Ci cztery prompty w jednym czacie, które robią to krok po kroku."
// Cztery stopnie = cztery prompty. Clawd wskakuje stopień po stopniu i na szczycie wbija flagę.
import React from 'react';
import { Words, Keyword, HighlightBox } from '../components/Text';
import { Clawd } from '../components/Clawd';
import { TOOLS } from '../components/props';
import { C } from '../lib/theme';
import { prog, expoOut, cubicInOut, clamp, lerp } from '../lib/anim';

const BASE = 1130;
const STEP = (i) => ({ left: 150 + i * 190, w: 176, top: BASE - (i + 1) * 120, cx: 238 + i * 190 });
const HOPS = [2.0, 2.65, 3.3];   // skok na stopień 2, 3, 4

export default function S03({ t }) {
  // pozycja Clawda: stoi na stopniu k, skacze łukiem na k+1
  let k = 0, hop = 0;
  HOPS.forEach((h, i) => { const p = prog(t, h, 0.4); if (p >= 1) k = i + 1; else if (p > 0) { k = i; hop = p; } });
  const a = STEP(k), b = STEP(Math.min(3, k + 1)), e = cubicInOut(hop);
  const cx = lerp(a.cx, b.cx, e), cy = lerp(a.top, b.top, e) - Math.sin(Math.PI * hop) * 110;
  const drop = prog(t, 1.1, 0.35), dy = (1 - expoOut(drop)) * -300;
  const top = t > 3.75;
  return (
    <>
      <Keyword t={t} at={0.3} text="4 PROMPTY" y={330} max={180} />
      {[0, 1, 2, 3].map((i) => {
        const s = STEP(i), p = expoOut(prog(t, 0.7 + i * 0.12, 0.45));
        return (
          <div key={i} style={{ position: 'absolute', left: s.left, top: s.top, width: s.w, height: BASE - s.top, background: C.card, borderRadius: '22px 22px 0 0',
            transform: `scaleY(${p})`, transformOrigin: '50% 100%', boxShadow: '0 30px 60px rgba(0,0,0,.22)' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 18, textAlign: 'center', fontSize: 76, fontWeight: 700, color: i === 3 ? C.accent : C.cardText, opacity: clamp(p * 2 - 1) }}>{i + 1}</div>
          </div>
        );
      })}
      <Clawd x={cx} y={cy + dy} u={7} t={t} opacity={clamp(drop * 5)} arms={top ? 'up' : hop > 0 ? 'up' : 'down'} squash={hop > 0 ? -0.1 : 0}
        hold={top ? { ...TOOLS.flag, px: 1.6 } : null} />
      <Words t={t} at={1.3} text="w jednym czacie" size={60} y={1190} />
      <HighlightBox t={t} at={3.4} text="krok po kroku" size={66} y={1275} />
    </>
  );
}
