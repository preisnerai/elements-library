// S04 — prompt 1: „chcę zbudować pełne drzewo genealogiczne, więc zapytaj mnie o wszystko…"
// Clawd pisze na laptopie, w oknie czatu pojawia się prompt, potem ChatGPT „pisze" i odpowiada pytaniami.
import React from 'react';
import { Kicker } from '../components/Text';
import { Card } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { Laptop } from '../components/Devices';
import { Bubble, Dots, Lines } from '../components/Family';
import { C } from '../lib/theme';
import { clamp, blurIn } from '../lib/anim';

const PROMPT = 'Chcę zbudować pełne drzewo genealogiczne. Zapytaj mnie o wszystko, czego potrzebujesz.';

export default function S04({ t }) {
  const typing = t > 0.6 && t < 3.0;
  return (
    <>
      <Kicker t={t} at={0.05} text="PROMPT 1" y={270} size={44} />
      <Card t={t} at={0.15} x={110} y={350} w={800} h={560} title="ChatGPT">
        <Bubble t={t} at={0.6} text={PROMPT} x={140} y={34} w={620} size={46} cps={38} />
        <Dots t={t} at={3.05} until={3.6} x={40} y={330} />
        {t > 3.6 && <>
          {[0, 1, 2].map((i) => <div key={i} style={{ position: 'absolute', left: 40, top: 330 + i * 52, width: 44, height: 40, borderRadius: 12, background: '#2A2A2E', color: C.cardText, fontSize: 30, fontWeight: 700, textAlign: 'center', lineHeight: '40px', ...blurIn(t, 3.6 + i * 0.16, { dist: 10 }) }}>?</div>)}
          <Lines t={t} at={3.65} x={104} y={342} widths={[420, 330, 470]} gap={52} first={C.accent} />
        </>}
      </Card>
      <div style={blurIn(t, 0.3, { dist: 30 })}>
        <Laptop x={250} y={960} s={0.62}>
          {[0.75, 0.5, 0.9, 0.6].map((w, r) => <div key={r} style={{ position: 'absolute', left: 16, top: 20 + r * 30, height: 14, borderRadius: 7, background: 'rgba(255,255,255,.75)', width: 210 * w * clamp((t - 0.7 - r * 0.5) * 2) }} />)}
        </Laptop>
      </div>
      <Clawd x={720} y={1125} u={9} t={t} flip arms={typing ? (Math.floor(t * 8) % 2 ? 'reach' : 'down') : t > 3.6 ? 'up' : 'down'} lift={t > 3.6 && t < 4.4 ? Math.abs(Math.sin((t - 3.6) * 8)) * 1.5 : 0} />
    </>
  );
}
