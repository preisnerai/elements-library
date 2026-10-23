// Tło jak w referencjach: jasnoszare, delikatna siatka, winieta, duże rozmyte czarne gwiazdy w rogach (głębia ostrości).
// kick (0..1) — impuls przejścia między scenami: gwiazdy wjeżdżają i obracają się mocniej.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C } from '../lib/theme';

export const starPath = (n, R, r) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = (Math.PI * i) / n - Math.PI / 2, rad = i % 2 ? r : R; d += `${i ? 'L' : 'M'}${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`; } return d + 'Z'; };
export const Star = ({ x, y, R, rot, blur, opacity = 1, color = '#111' }) => (
  <svg width={R * 2 + 300} height={R * 2 + 300} style={{ position: 'absolute', left: x - R - 150, top: y - R - 150, filter: `blur(${blur}px)`, opacity }}>
    <g transform={`translate(${R + 150},${R + 150}) rotate(${rot})`}><path d={starPath(9, R, R * 0.42)} fill={color} /></g>
  </svg>
);

export const Background = ({ t, kick = 0 }) => (
  <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
    <AbsoluteFill style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.055) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(0,0,0,.055) 1.5px, transparent 1.5px)', backgroundSize: '108px 108px', backgroundPosition: '-48px 20px',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, #000 40%, transparent 90%)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 44%, transparent 55%, rgba(0,0,0,.13) 100%)' }} />
    <Star x={1090 + 40 * Math.sin(t * 0.5) - 180 * kick} y={90 + 140 * kick} R={300} rot={t * 10 + kick * 70} blur={30 - 10 * kick} opacity={0.88} />
    <Star x={-20 + 160 * kick} y={1840 - 30 * Math.sin(t * 0.4) - 160 * kick} R={360} rot={-t * 8 - kick * 60} blur={40 - 12 * kick} opacity={0.85} />
  </AbsoluteFill>
);
