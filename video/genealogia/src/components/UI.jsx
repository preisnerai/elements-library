// Ciemne karty, chipy, łączniki przerywane — elementy UI ze stylu referencji.
import React from 'react';
import { C } from '../lib/theme';
import { prog, expoOut, backOut, clamp, cubicOut } from '../lib/anim';

/** Ciemne okno z paskiem 3 kropek. x,y = lewy górny róg; enter = czas wejścia (blur + przesuw). */
export const Card = ({ t, at = 0, x, y, w, h, title = '', children, header = true, style = {}, radius = 34, light = false }) => {
  const p = prog(t, at, 0.5), e = expoOut(p);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: radius, background: light ? '#FAFAFA' : C.card, overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,.28), 0 12px 24px rgba(0,0,0,.18)', opacity: clamp(p * 3), filter: `blur(${((1 - e) * 12).toFixed(2)}px)`, transform: `translateY(${((1 - e) * 60).toFixed(1)}px) scale(${0.96 + 0.04 * e})`, ...style }}>
      {header && <div style={{ height: 58, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', borderBottom: `1.5px solid ${light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.08)'}` }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: light ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.22)' }} />)}
        <span style={{ marginLeft: 14, fontSize: 28, color: light ? 'rgba(0,0,0,.5)' : 'rgba(255,255,255,.55)', letterSpacing: '-0.01em' }}>{title}</span>
      </div>}
      <div style={{ position: 'absolute', left: 0, right: 0, top: header ? 58 : 0, bottom: 0 }}>{children}</div>
    </div>
  );
};

/** Chip: ciemna pigułka z ikoną; x,y = lewy górny róg (albo center=true → x to środek). */
export const Chip = ({ t, at = 0, x, y, text, icon = null, size = 46, center = false, accent = false, style = {} }) => {
  const p = prog(t, at, 0.45), s = p > 0 ? 0.6 + 0.4 * backOut(p, 2.2) : 0.6;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `${center ? 'translateX(-50%) ' : ''}scale(${s})`, transformOrigin: center ? '50% 50%' : '0% 50%', opacity: clamp(p * 4),
      display: 'inline-flex', alignItems: 'center', gap: size * 0.35, height: size * 2, padding: `0 ${size * 0.75}px 0 ${size * (icon ? 0.55 : 0.75)}px`, borderRadius: size * 0.45,
      background: accent ? C.accent : C.card, color: '#fff', fontSize: size, fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap', boxShadow: '0 20px 40px rgba(0,0,0,.22)', ...style }}>
      {icon}{text}
    </div>
  );
};

/** Przerywany łącznik rysowany od (x1,y1) do (x2,y2), krzywa Béziera; bend = wybrzuszenie (px). */
let cid = 0;
export const Connector = ({ t, at = 0, dur = 0.4, x1, y1, x2, y2, bend = 80, color = C.ink, width = 5, dot = true }) => {
  const p = cubicOut(prog(t, at, dur)); const id = React.useMemo(() => `cm${cid++}`, []);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / L) * bend, cy = my + (dx / L) * bend;
  const d = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <defs><mask id={id}><path d={d} pathLength={1} stroke="#fff" strokeWidth={width * 3} fill="none" strokeDasharray="1 1" strokeDashoffset={1 - p} /></mask></defs>
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeDasharray={`${width * 2.6} ${width * 2.4}`} strokeLinecap="round" mask={`url(#${id})`} />
      {dot && <circle cx={x1} cy={y1} r={width * 2 * clamp(p * 4)} fill={C.bg} stroke={color} strokeWidth={width} />}
    </svg>
  );
};

/** Linie „kodu" (kolorowe belki) w karcie; deleted (0..1) kasuje linie od dołu jak backspace. */
export const CodeLines = ({ x = 40, y = 40, w = 600, rows = 7, deleted = 0, t = 0 }) => {
  const pal = ['#C792EA', '#82AAFF', '#F78C6C', '#C3E88D', '#89DDFF', '#FFCB6B'];
  const spec = [[0, 0.45], [1, 0.7], [1, 0.55], [2, 0.4], [1, 0.62], [0, 0.3], [1, 0.5], [2, 0.66]];
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      {Array.from({ length: rows }).map((_, i) => {
        const [indent, len] = spec[i % spec.length];
        const k = clamp(deleted * rows - (rows - 1 - i));
        return (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', height: 44, marginLeft: indent * 46 }}>
            <span style={{ width: 30, fontSize: 24, color: 'rgba(255,255,255,.3)', textAlign: 'right' }}>{i + 1}</span>
            {[0.35, 0.65].map((part, j) => <span key={j} style={{ height: 16, borderRadius: 8, width: w * len * part * (1 - k), background: pal[(i * 2 + j) % pal.length], opacity: 0.9 }} />)}
          </div>
        );
      })}
    </div>
  );
};
