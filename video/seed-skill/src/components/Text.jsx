// Typografia: jedna rodzina (Inter), tylko Regular 400 i Bold 700.
import React from 'react';
import { C, fit, measure } from '../lib/theme';
import { blurIn, prog, expoOut, clamp } from '../lib/anim';

// markup: **pogrubione**, ==akcent== (pogrubione, kolor Clawda)
const parse = (s) => s.split(' ').map((w) => {
  if (/^\*\*.*\*\*[,.:!?]?$/.test(w)) return { t: w.replace(/\*\*/g, ''), bold: true };
  if (/^==.*==[,.:!?]?$/.test(w)) return { t: w.replace(/==/g, ''), bold: true, accent: true };
  return { t: w, bold: false };
});

/** Linia tekstu: słowa wchodzą po kolei z rozmycia. x/y = środek górnej krawędzi (px) przy align=center. */
export const Words = ({ t, at = 0, text, size = 62, step = 0.09, color = C.ink, x = 510, y, width = 840, align = 'center', style = {}, lineHeight = 1.15, wrap = false }) => {
  // bez zawijania: rozmiar zmniejszany, aż cała linia zmieści się w szerokości (pomiar pesymistyczny: Bold)
  const plain = text.replace(/\*\*|==/g, '');
  const fs = wrap ? size : Math.min(size, fit(plain, 700, size, width, -0.02));
  return (
  <div style={{ position: 'absolute', left: align === 'center' ? x - width / 2 : x, top: y, width, textAlign: align, fontSize: fs, lineHeight, letterSpacing: '-0.02em', color, whiteSpace: wrap ? 'normal' : 'nowrap', ...style }}>
    {parse(text).map((w, i) => (
      <React.Fragment key={i}>{i ? ' ' : ''}<span style={{ display: 'inline-block', fontWeight: w.bold ? 700 : 400, color: w.accent ? C.accent : undefined, ...blurIn(t, at + i * step) }}>{w.t}</span></React.Fragment>
    ))}
  </div>
  );
};

/** Ogromne słowo-klucz: litery wyostrzają się po kolei (jak „SECRET" w referencji), auto-fit do szerokości. */
export const Keyword = ({ t, at = 0, text, max = 190, width = 800, x = 510, y, color = C.ink, letterStep = 0.035, tracking = -0.045, style = {} }) => {
  const size = fit(text, 700, max, width, tracking);
  return (
    <div style={{ position: 'absolute', left: x - 540, width: 1080, top: y, textAlign: 'center', fontSize: size, fontWeight: 700, lineHeight: 1, letterSpacing: `${tracking}em`, color, whiteSpace: 'nowrap', ...style }}>
      {[...text].map((ch, i) => {
        const p = prog(t, at + i * letterStep, 0.45), e = expoOut(p);
        return <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', opacity: clamp(p * 2.5), filter: `blur(${((1 - e) * 20).toFixed(2)}px)`, transform: `translateY(${((1 - e) * 30).toFixed(1)}px) scale(${0.9 + 0.1 * e})` }}>{ch}</span>;
      })}
    </div>
  );
};
export const keywordSize = (text, max = 190, width = 800, tracking = -0.045) => fit(text, 700, max, width, tracking);

/** Czarna belka z białym tekstem odsłaniana od lewej (jak „nobody is talking about"). y = góra belki. */
export const HighlightBox = ({ t, at = 0, text, size = 60, x = 510, y, bg = C.ink, color = '#fff', style = {} }) => {
  const box = expoOut(prog(t, at, 0.42)), txt = prog(t, at + 0.12, 0.38);
  return (
    <div style={{ position: 'absolute', left: x - 540, width: 1080, top: y, display: 'flex', justifyContent: 'center', ...style }}>
      <div style={{ position: 'relative', padding: `${size * 0.16}px ${size * 0.42}px ${size * 0.24}px`, fontSize: size, fontWeight: 700, letterSpacing: '-0.025em', color, whiteSpace: 'nowrap', lineHeight: 1.1 }}>
        <div style={{ position: 'absolute', inset: 0, background: bg, transform: `scaleX(${box})`, transformOrigin: '0% 50%' }} />
        <span style={{ position: 'relative', display: 'inline-block', clipPath: `inset(-10% ${(100 - txt * 100).toFixed(1)}% -10% 0)` }}>{text}</span>
      </div>
    </div>
  );
};

/** Mała etykieta sekcji, np. „SKILL 01" z pomarańczowym pikselem. */
export const Kicker = ({ t, at = 0, text, x = 510, y, size = 40, color = C.ink, style = {} }) => (
  <div style={{ position: 'absolute', left: x - 540, width: 1080, top: y, display: 'flex', justifyContent: 'center', ...blurIn(t, at, { dist: 14, blur: 12 }), ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: size, fontWeight: 700, letterSpacing: '0.12em', color }}>
      <span style={{ width: size * 0.42, height: size * 0.42, background: C.accent }} />{text}
    </div>
  </div>
);
export { measure };
