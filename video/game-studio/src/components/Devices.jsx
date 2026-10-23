// Urządzenia (kreska, czarne) z ekranem gry w środku. x,y = lewy górny róg obudowy; s = skala.
import React from 'react';
import { GameScreen } from './GameScreen';
import { C } from '../lib/theme';

export const Phone = ({ x, y, s = 1, t, variant = 'color', style = {} }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 230 * s, height: 460 * s, borderRadius: 40 * s, background: C.card, padding: 12 * s, boxShadow: '0 30px 60px rgba(0,0,0,.25)', ...style }}>
    <div style={{ width: '100%', height: '100%', borderRadius: 30 * s, overflow: 'hidden', position: 'relative', background: '#000' }}>
      <GameScreen variant={variant} t={t} w={206 * s} h={436 * s} />
      <div style={{ position: 'absolute', top: 10 * s, left: '50%', width: 70 * s, height: 18 * s, marginLeft: -35 * s, borderRadius: 9 * s, background: C.card }} />
    </div>
  </div>
);
export const Tablet = ({ x, y, s = 1, t, variant = 'color', style = {} }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 400 * s, height: 300 * s, borderRadius: 30 * s, background: C.card, padding: 16 * s, boxShadow: '0 30px 60px rgba(0,0,0,.25)', ...style }}>
    <div style={{ width: '100%', height: '100%', borderRadius: 16 * s, overflow: 'hidden' }}><GameScreen variant={variant} t={t} w={368 * s} h={268 * s} /></div>
  </div>
);
export const Laptop = ({ x, y, s = 1, t, variant = 'color', style = {} }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 460 * s, height: 320 * s, ...style }}>
    <div style={{ position: 'absolute', left: 30 * s, top: 0, width: 400 * s, height: 270 * s, borderRadius: 18 * s, background: C.card, padding: 14 * s, boxShadow: '0 30px 60px rgba(0,0,0,.25)' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 8 * s, overflow: 'hidden' }}><GameScreen variant={variant} t={t} w={372 * s} h={242 * s} /></div>
    </div>
    <div style={{ position: 'absolute', left: 0, top: 266 * s, width: 460 * s, height: 26 * s, borderRadius: `${6 * s}px ${6 * s}px ${16 * s}px ${16 * s}px`, background: '#2A2A2D', boxShadow: '0 18px 30px rgba(0,0,0,.22)' }} />
  </div>
);

/** Pad (wektor, czarny) — x,y = środek. */
export const Gamepad = ({ x, y, s = 1, style = {} }) => (
  <svg width={300 * s} height={190 * s} viewBox="0 0 300 190" style={{ position: 'absolute', left: x - 150 * s, top: y - 95 * s, overflow: 'visible', ...style }}>
    <path d="M70 30 H230 C275 30 300 90 296 140 C293 178 260 192 236 168 L206 136 H94 L64 168 C40 192 7 178 4 140 C0 90 25 30 70 30 Z" fill={C.card} />
    <rect x="62" y="70" width="18" height="58" rx="4" fill="#F2F2F2" /><rect x="42" y="90" width="58" height="18" rx="4" fill="#F2F2F2" />
    {[[222, 78, C.accent], [252, 100, '#F2F2F2'], [222, 122, '#F2F2F2'], [192, 100, '#F2F2F2']].map(([cx, cy, f], i) => <circle key={i} cx={cx} cy={cy} r="13" fill={f} />)}
    <rect x="128" y="62" width="44" height="12" rx="6" fill="#55555A" />
  </svg>
);
