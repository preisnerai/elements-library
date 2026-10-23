// Edytorska kinetyczna typografia (styl referencji użytkownika): jasne tło z siatką, słowa wchodzą z rozmycia,
// ściana transkryptu → AI zaznacza markerem 3 frazy → frazy przelatują do ciemnej karty jako notatka → wynik.
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, delayRender, continueRender } from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';

const CX = 525, COLW = 830, LEFT = CX - COLW / 2;   // kolumna x 110–940 (strefa bezpieczna TikToka)
const HERO_W = 790;                                   // zapas szerokości dla słowa-klucza / wyniku
const T_TOP = 650, T_H = 620, CARD_TOP = 640, ROW = 118;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const expoOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const expoInOut = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2);
const cubicOut = (x) => 1 - Math.pow(1 - x, 3);
const backOut = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
const prog = (t, start, dur) => clamp((t - start) / dur);
const lerp = (a, b, k) => a + (b - a) * k;

let ctx;
const measure = (text, weight, size) => { ctx = ctx || document.createElement('canvas').getContext('2d'); ctx.font = `${weight} ${size}px Inter`; return ctx.measureText(text).width; };
const fit = (text, weight, max, width) => { let s = max; while (s > 12 && measure(text, weight, s) > width) s -= 1; return s; };
const words = (s) => s.split(' ').map((w) => ({ t: w.replace(/\*\*/g, ''), bold: /^\*\*.*\*\*$/.test(w) }));
const fmtHM = (m) => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')} min`;
const blurIn = (t, at, dur = 0.42, dist = 26, maxBlur = 16) => { const p = prog(t, at, dur), e = expoOut(p); return { opacity: clamp(p * 2.5), filter: `blur(${(1 - e) * maxBlur}px)`, transform: `translateY(${(1 - e) * dist}px) scale(${0.95 + 0.05 * e})` }; };
const blurOut = (t, at, dur = 0.32) => { const p = cubicOut(prog(t, at, dur)); return { opacity: 1 - p, filter: `blur(${p * 24}px)` }; };

const Words = ({ t, at, text, size, color, step = 0.1 }) => words(text).map((w, i) => (
  <React.Fragment key={i}>{i ? ' ' : ''}<span style={{ display: 'inline-block', fontWeight: w.bold ? 700 : 400, color, ...blurIn(t, at + i * step) }}>{w.t}</span></React.Fragment>
));

const starPath = (n, R, r) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = (Math.PI * i) / n - Math.PI / 2, rad = i % 2 ? r : R; d += `${i ? 'L' : 'M'}${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`; } return d + 'Z'; };
const Star = ({ x, y, R, rot, blur, opacity }) => (
  <svg width={R * 2 + 400} height={R * 2 + 400} style={{ position: 'absolute', left: x - R - 200, top: y - R - 200, filter: `blur(${blur}px)`, opacity }}>
    <g transform={`translate(${R + 200},${R + 200}) rotate(${rot})`}><path d={starPath(9, R, R * 0.45)} fill="#111" /></g>
  </svg>
);
const Background = ({ t, C, kick }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <AbsoluteFill style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(0,0,0,.06) 1.5px, transparent 1.5px)', backgroundSize: '108px 108px', backgroundPosition: `${CX - 54}px 20px`,
      WebkitMaskImage: 'radial-gradient(ellipse 75% 55% at 50% 44%, #000 35%, transparent 85%)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,.14) 100%)' }} />
    <Star x={1070 + 30 * Math.sin(t * 0.7) + 90 * kick} y={110 - 60 * kick} R={330} rot={t * 12 + kick * 40} blur={52} opacity={0.62} />
    <Star x={10 - 110 * kick} y={1850 + 70 * kick} R={380} rot={-t * 9 - kick * 30} blur={64} opacity={0.58} />
  </AbsoluteFill>
);

export const Insert = (props) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps, C = props.colors, I = props.intro, TR = props.transcript, R = props.result, TM = props.timing;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all([document.fonts.load('400 64px Inter'), document.fonts.load('700 64px Inter')]).then(() => { setReady(true); continueRender(handle); }); }, [handle]);
  if (!ready) return null;

  // --- transkrypt: parsowanie fraz [[...]] i ich pozycji w linii
  const fT = Math.min(34, ...TR.lines.map((l) => fit(l.replace(/\[\[|\]\]/g, ''), 400, 34, COLW)));
  const LH = Math.round(fT * 1.45);
  const keys = [];
  const lines = TR.lines.map((l, li) => l.split(/(\[\[.*?\]\])/).filter(Boolean).map((seg) => {
    const key = /^\[\[.*\]\]$/.test(seg), text = seg.replace(/\[\[|\]\]/g, '');
    if (key) { const prefix = l.slice(0, l.indexOf(seg)).replace(/\[\[|\]\]/g, ''); keys.push({ text, li, x: LEFT + measure(prefix, 400, fT) }); }
    return { text, key };
  }));
  const scroll = lerp(70, -40, cubicOut(prog(t, TM.toHeader + 0.15, TM.extract - TM.toHeader + 0.4)));

  // --- faza 1 → nagłówek
  const hdr = expoInOut(prog(t, TM.toHeader, 0.55));
  const kwSize = fit(I.keyword, 700, 230, HERO_W), kwE = expoOut(prog(t, 0.22, 0.55));
  const leadTop = lerp(700, 268, hdr), leadScale = lerp(1, 0.78, hdr);
  const kwTop = lerp(786, 330, hdr), kwScale = lerp(1, 0.46, hdr);
  const introOut = blurOut(t, TM.result - 0.05, 0.3);
  // --- faza 2: transkrypt → wyciągnięcie fraz → karta
  const ext = (k) => expoInOut(prog(t, TM.extract + k * 0.07, 0.6));
  const wallOut = cubicOut(prog(t, TM.extract, 0.45));
  const cardIn = expoOut(prog(t, TM.extract + 0.15, 0.5));
  const midOut = blurOut(t, TM.result - 0.05, 0.3);
  // --- faza 3: wynik
  const heroSize = fit(fmtHM(R.minutes), 700, 230, HERO_W);
  const shown = R.minutes * cubicOut(prog(t, TM.result + 0.3, 0.95));
  const heroIn = blurIn(t, TM.result + 0.2, 0.45, 0, 26);
  const underline = expoOut(prog(t, TM.result + 1.35, 0.5));
  const kick = Math.sin(Math.PI * prog(t, TM.result - 0.15, 0.7)) + 0.6 * Math.sin(Math.PI * prog(t, TM.toHeader - 0.1, 0.6));
  const push = 1 + 0.03 * (t / props.duration);

  return (
    <AbsoluteFill style={{ fontFamily: 'Inter', color: C.ink }}>
      <Background t={t} C={C} kick={kick} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${CX}px 840px` }}>
        {t < TM.result + 0.4 && <div style={introOut}>
          {/* wstęp: mała linia + ogromne słowo-klucz; potem kurczy się do nagłówka */}
          <div style={{ position: 'absolute', left: CX - 540, width: 1080, top: leadTop, textAlign: 'center', fontSize: 64, letterSpacing: '-0.02em', whiteSpace: 'nowrap', transform: `scale(${leadScale})`, transformOrigin: '50% 0%' }}>
            <Words t={t} at={0.02} text={I.lead} size={64} color={C.ink} step={0.09} />
          </div>
          <div style={{ position: 'absolute', left: CX - 540, width: 1080, top: kwTop, textAlign: 'center', fontSize: kwSize, fontWeight: 700, lineHeight: 1, letterSpacing: `${-0.045 + (1 - kwE) * 0.06}em`,
            opacity: clamp(prog(t, 0.22, 0.55) * 2.5), filter: `blur(${(1 - kwE) * 26}px)`, transform: `scale(${(1.2 - 0.2 * kwE) * kwScale})`, transformOrigin: '50% 0%' }}>{I.keyword}</div>
        </div>}

        {t >= TM.toHeader && t < TM.result + 0.4 && <div style={midOut}>
          {/* etykieta + ściana transkryptu */}
          <div style={{ position: 'absolute', left: LEFT, top: 540, display: 'inline-flex', alignItems: 'center', gap: 16, height: 84, padding: '0 30px 0 26px', borderRadius: 20, background: C.card, color: '#fff', fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em',
            boxShadow: '0 18px 36px rgba(0,0,0,.22)', ...blurIn(t, TM.toHeader + 0.25, 0.4, 20, 12), opacity: clamp(prog(t, TM.toHeader + 0.25, 0.2) * 3) * (1 - wallOut) }}>
            <span style={{ width: 20, height: 20, borderRadius: 10, background: C.accent, opacity: Math.floor(t * 3) % 2 ? 1 : 0.35 }} />{TR.label}
          </div>
          <div style={{ position: 'absolute', left: LEFT, top: T_TOP, width: COLW, height: T_H, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 90px, #000 calc(100% - 110px), transparent 100%)',
            opacity: clamp(prog(t, TM.toHeader + 0.3, 0.35) * 2) * (1 - wallOut), filter: `blur(${wallOut * 12}px)`, transform: `scaleY(${1 - 0.2 * wallOut})`, transformOrigin: '50% 45%' }}>
            <div style={{ position: 'absolute', left: 0, top: scroll, fontSize: fT, lineHeight: `${LH}px`, color: C.muted, whiteSpace: 'nowrap' }}>
              {lines.map((segs, i) => <div key={i}>{segs.map((s, j) => <span key={j} style={{ visibility: s.key ? 'hidden' : 'visible' }}>{s.text}</span>)}</div>)}
            </div>
          </div>
          {/* karta notatki */}
          <div style={{ position: 'absolute', left: LEFT, top: CARD_TOP, width: COLW, height: 3 * ROW + 70, borderRadius: 34, background: C.card, boxShadow: '0 38px 70px rgba(0,0,0,.28), 0 10px 22px rgba(0,0,0,.2)',
            opacity: clamp(cardIn * 3), filter: `blur(${(1 - cardIn) * 14}px)`, transform: `translateY(${(1 - cardIn) * 40}px) scale(${0.96 + 0.04 * cardIn})` }} />
          {/* frazy: w transkrypcie → marker → lot do karty */}
          {keys.map((k, i) => {
            const hl = expoOut(prog(t, TM.highlight + i * 0.12, 0.35)), e = ext(i);
            const x = lerp(k.x, LEFT + 118, e), y = lerp(T_TOP + scroll + k.li * LH, CARD_TOP + 40 + i * ROW + (ROW - 60) / 2 - 6, e);
            const size = lerp(fT, 50, e), fw = e > 0.15 ? 700 : 400;
            const check = backOut(prog(t, TM.extract + 0.45 + i * 0.08, 0.35));
            const visible = t >= TM.toHeader + 0.3;
            return visible && (
              <div key={i} style={{ position: 'absolute', left: x, top: y, height: size * 1.45, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', fontSize: size, fontWeight: fw, letterSpacing: `${-0.02 * e}em`,
                color: hl > 0.4 ? '#fff' : C.muted, opacity: clamp(prog(t, TM.toHeader + 0.3, 0.35) * 2) }}>
                <div style={{ position: 'absolute', left: -8, right: -8, top: 2, bottom: 2, borderRadius: 8, background: C.ink, transform: `scaleX(${hl})`, transformOrigin: '0% 50%', opacity: 1 - cardIn * 0.999 }} />
                <span style={{ position: 'relative' }}>{k.text}</span>
                {e > 0 && <svg width="56" height="56" viewBox="0 0 24 24" style={{ position: 'absolute', left: -86, top: (size * 1.45 - 56) / 2, transform: `scale(${prog(t, TM.extract + 0.45 + i * 0.08, 0.01) ? check : 0})` }}>
                  <circle cx="12" cy="12" r="12" fill={C.accent} /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
            );
          })}
        </div>}

        {t >= TM.result && <>
          <div style={{ position: 'absolute', left: CX - 540, width: 1080, top: 690, textAlign: 'center', fontSize: 64, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            <Words t={t} at={TM.result + 0.02} text={R.lead} size={64} color={C.ink} step={0.09} />
          </div>
          <div style={{ position: 'absolute', left: CX - 540, width: 1080, top: 776, textAlign: 'center', fontSize: heroSize, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', color: C.accent, ...heroIn }}>{fmtHM(shown)}</div>
          <div style={{ position: 'absolute', left: CX - HERO_W / 2, width: HERO_W, top: 776 + heroSize * 0.98, height: 10, borderRadius: 5, background: C.ink, transform: `scaleX(${underline})`, transformOrigin: '0% 50%' }} />
          <div style={{ position: 'absolute', left: CX - 540, width: 1080, top: 776 + heroSize + 70, textAlign: 'center', fontSize: 56, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            <Words t={t} at={TM.result + 1.25} text={R.proof} size={56} color={C.ink} step={0.08} />
          </div>
        </>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
