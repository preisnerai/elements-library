// Klocki filmu „drzewo genealogiczne": osoby (pixel-art), dymki czatu, kropki pisania, belki odpowiedzi, ikony.
import React from 'react';
import { C } from '../lib/theme';
import { prog, expoOut, backOut, clamp, typed } from '../lib/anim';
import { PixelArt } from './Pixel';

const SK = '#E9C9AF', EY = '#2B2B2E';
const MAN = ['...hhhh...', '..hhhhhh..', '..hffffh..', '..feffef..', '...ffff...', '..ssssss..', '.ssssssss.', '.ssssssss.', '.ssssssss.'];
const WOMAN = ['...hhhh...', '..hhhhhh..', '.hhffffhh.', '.hfeffefh.', '.hhffffhh.', '.hhsssshh.', '.ssssssss.', '.ssssssss.', '.ssssssss.'];
export const FACES = {
  m: { grid: MAN, pal: { h: '#3A3A3E', f: SK, e: EY, s: '#6A6A72' } },
  f: { grid: WOMAN, pal: { h: '#7A4A2A', f: SK, e: EY, s: '#8C8C93' } },
  om: { grid: MAN, pal: { h: '#CFCFD2', f: SK, e: EY, s: '#4A4A50' } },
  of: { grid: WOMAN, pal: { h: '#DADADD', f: SK, e: EY, s: '#76767D' } },
};

/** Karta osoby. x,y = środek. ghost = przerywany kontur z „?"; reveal = chwila, w której duch zamienia się w osobę. */
export const Person = ({ t, at = 0, x, y, s = 1, kind = 'm', name, found = false, ghost = false, reveal = null, light = false, style = {} }) => {
  const w = 150 * s, h = (name ? 196 : 150) * s;
  const p = prog(t, at, 0.45), sc = p > 0 ? 0.5 + 0.5 * backOut(p, 2) : 0.5;
  const r = reveal == null ? (ghost ? 0 : 1) : expoOut(prog(t, reveal, 0.4));
  const f = FACES[kind];
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: clamp(p * 4), transform: `scale(${sc})`, ...style }}>
      {r < 1 && <div style={{ position: 'absolute', inset: 0, borderRadius: 26 * s, border: `${4 * s}px dashed ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 84 * s, fontWeight: 700, color: C.ink, opacity: 1 - r, background: 'rgba(255,255,255,.35)' }}>?</div>}
      {r > 0 && <div style={{ position: 'absolute', inset: 0, borderRadius: 26 * s, background: light ? '#F3F3F3' : C.card, boxShadow: light ? 'none' : '0 24px 48px rgba(0,0,0,.24)',
        outline: found ? `${5 * s}px solid ${C.accent}` : undefined, outlineOffset: 5 * s, opacity: clamp(r * 2), transform: `scale(${0.8 + 0.2 * r})` }}>
        <PixelArt grid={f.grid} palette={f.pal} unit={10 * s} style={{ position: 'absolute', left: (w - 100 * s) / 2, top: 26 * s }} />
        {name && <div style={{ position: 'absolute', left: 0, right: 0, top: 130 * s, textAlign: 'center', fontSize: 44 * s, fontWeight: 700, color: C.cardText, whiteSpace: 'nowrap', letterSpacing: '-0.03em' }}>{name}</div>}
      </div>}
    </div>
  );
};

/** Dymek wiadomości z tekstem pisanym na żywo. Rozmiar dymka od początku = pełny tekst (nic nie skacze). x,y = lewy górny róg. */
export const Bubble = ({ t, at = 0, text, x, y, w = 600, size = 44, cps = 38, me = true }) => {
  const shown = typed(text, t, at, cps), typing = shown.length < text.length && t >= at;
  const p = prog(t, at - 0.2, 0.3);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, boxSizing: 'border-box', padding: `${size * 0.42}px ${size * 0.58}px`, borderRadius: size * 0.6,
      background: me ? '#F3F3F3' : '#2A2A2E', color: me ? C.ink : C.cardText, fontSize: size, lineHeight: 1.18, letterSpacing: '-0.02em',
      opacity: clamp(p * 3), transform: `translateY(${((1 - expoOut(p)) * 20).toFixed(1)}px)` }}>
      <span>{shown}</span>
      <span style={{ display: 'inline-block', width: 4, height: size * 0.95, marginLeft: 2, background: C.accent, verticalAlign: '-0.14em', opacity: typing || (t > at - 0.2 && shown.length === 0) ? (Math.floor(t * 5) % 2 ? 1 : 0.2) : 0 }} />
      <span style={{ opacity: 0 }}>{text.slice(shown.length)}</span>
    </div>
  );
};

/** „Pisze…" — trzy kropki. */
export const Dots = ({ t, at, until = 99, x, y }) => {
  if (t < at || t > until) return null;
  const k = Math.floor((t - at) * 7) % 3;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 12, padding: '20px 26px', borderRadius: 30, background: '#2A2A2E' }}>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: 16, height: 16, borderRadius: 8, background: '#F3F3F3', opacity: k === i ? 1 : 0.3 }} />)}
    </div>
  );
};

/** Belki odpowiedzi (tekst bez treści) — rosną po kolei. */
export const Lines = ({ t, at, x, y, widths, gap = 34, h = 16, color = 'rgba(255,255,255,.7)', step = 0.16, first = null }) => (
  <>{widths.map((w, i) => (
    <div key={i} style={{ position: 'absolute', left: x, top: y + i * gap, height: h, borderRadius: h / 2, background: i === 0 && first ? first : color, width: w * expoOut(prog(t, at + i * step, 0.35)) }} />
  ))}</>
);

// ikony 7x7 (pixel-art, jasne na ciemnym)
export const ICONS = {
  person: ['..www..', '..www..', '..www..', '.......', '.wwwww.', 'wwwwwww', 'wwwwwww'],
  pin: ['.wwwww.', 'ww...ww', 'ww...ww', '.wwwww.', '..www..', '...w...', '.......'],
  heart: ['.ww.ww.', 'wwwwwww', 'wwwwwww', '.wwwww.', '..www..', '...w...', '.......'],
  people: ['ww...ww', 'ww...ww', '.......', 'www.www', 'www.www', 'www.www', '.......'],
  doc: ['wwww...', 'w..ww..', 'w...ww.', 'w.ww.w.', 'w....w.', 'w.ww.w.', 'wwwwww.'],
  db: ['.wwwww.', 'w.....w', '.wwwww.', 'w.....w', '.wwwww.', 'w.....w', '.wwwww.'],
  candle: ['...w...', '..ww...', '...w...', '.wwwww.', '.wwwww.', '.wwwww.', '.wwwww.'],
  link: ['...wwww', '....www', '...w.ww', 'w.w...w', 'w......', 'w......', 'wwwww..'],
  check: ['......w', '.....ww', 'w...ww.', 'ww.ww..', '.www...', '..w....', '.......'],
};
export const Icon = ({ name, unit = 7, color = '#F3F3F3', style = {} }) => <PixelArt grid={ICONS[name]} palette={{ w: color }} unit={unit} style={style} />;
