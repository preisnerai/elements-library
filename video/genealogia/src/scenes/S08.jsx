// S08 — „powiedz mi, jaki jest początek mojego rodu i jak daleko wstecz da się go prześledzić."
// Oś czasu. Clawd idzie z lupą wstecz (w lewo): 2026 → 1900 → 1800 → 1650, gdzie wyrasta herb rodu.
import React from 'react';
import { Keyword, HighlightBox } from '../components/Text';
import { Chip } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { PixelArt } from '../components/Pixel';
import { TOOLS } from '../components/props';
import { C } from '../lib/theme';
import { prog, expoOut, cubicInOut, lerp, clamp } from '../lib/anim';

const LY = 900;
const YEARS = [{ x: 830, y: '2026' }, { x: 620, y: '1900' }, { x: 410, y: '1800' }, { x: 200, y: '1650' }];
const ARRIVE = [0.5, 1.6, 2.6, 3.6];
const SHIELD = ['kkkkkkkkkkk', 'kaaaakwwwwk', 'kaaaakwwwwk', 'kaaaakwwwwk', 'kkkkkkkkkkk', 'kwwwwkaaaak', 'kwwwwkaaaak', '.kwwwkaaak.', '..kwwkaak..', '...kkkkk...', '....kkk....'];

const clawdX = (t) => {
  if (t < ARRIVE[0]) return YEARS[0].x;
  for (let i = 0; i < 3; i++) if (t < ARRIVE[i + 1]) return lerp(YEARS[i].x, YEARS[i + 1].x, cubicInOut(prog(t, ARRIVE[i] + 0.15, ARRIVE[i + 1] - ARRIVE[i] - 0.15)));
  return YEARS[3].x;
};

export default function S08({ t }) {
  const line = expoOut(prog(t, 0.15, 0.6));
  const x = clawdX(t), walking = t > 0.65 && t < 3.6, end = t > 3.7;
  const sh = expoOut(prog(t, 3.7, 0.5));
  return (
    <>
      <Keyword t={t} at={0.2} text="WSTECZ" y={330} max={190} />
      <div style={{ position: 'absolute', left: 110, top: LY - 3, width: 800, height: 6, background: C.ink, borderRadius: 3, transform: `scaleX(${line})`, transformOrigin: '100% 50%' }} />
      {/* strzałka w lewo na końcu osi */}
      <svg width={40} height={40} style={{ position: 'absolute', left: 92, top: LY - 20, opacity: clamp(line * 3 - 2) }}><path d="M30 4 L8 20 L30 36" stroke={C.ink} strokeWidth={6} fill="none" /></svg>
      {YEARS.map((yr, i) => (
        <React.Fragment key={i}>
          <div style={{ position: 'absolute', left: yr.x - 12, top: LY - 12, width: 24, height: 24, borderRadius: 12, background: i === 3 ? C.accent : C.ink, transform: `scale(${expoOut(prog(t, ARRIVE[i] - 0.1, 0.3))})` }} />
          <Chip t={t} at={ARRIVE[i]} x={yr.x} y={690} center size={48} text={yr.y} accent={i === 3} />
        </React.Fragment>
      ))}
      <div style={{ position: 'absolute', left: 200 - 77, top: 950, transform: `translateY(${(1 - sh) * 40}px) scale(${0.6 + 0.4 * sh})`, opacity: clamp(sh * 3), transformOrigin: '50% 0%' }}>
        <PixelArt grid={SHIELD} palette={{ k: C.ink, a: C.accent, w: '#F3F3F3' }} unit={14} />
      </div>
      <Clawd x={end ? x + 120 : x} y={LY - 4} u={8} t={t} walk={walking} flip={!end} arms={end ? 'up' : 'rightUp'}
        hold={!end ? { ...TOOLS.magnifier, px: 1.3, rot: 10 } : null} lift={end ? Math.abs(Math.sin((t - 3.7) * 7)) * 1.3 : 0} />
      <HighlightBox t={t} at={3.9} text="początek Twojego rodu" size={60} y={1240} />
    </>
  );
}
