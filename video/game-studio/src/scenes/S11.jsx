// S11 — „Nie powtarzasz więc cudzej gry, tylko budujesz własną."
// A (0–1.55 s): „nie powtarzasz cudzej gry". Kopie cudzej gry wklejają się jedna na drugą (Ctrl+V ×3, wyblakłe kolory).
//   Clawd kręci głową „nie", „cudzej gry" dostaje pomarańczową kreskę, a Clawd odpycha stos kopii — wylatuje w lewo.
// B (1.5–3.2 s): od dołu wjeżdża „moja-gra" (miasto z klocków z S10), Clawd wskakuje na nią z flagą,
//   „tylko budujesz" (czarna belka) + ogromne „WŁASNĄ"; Clawd wbija flagę na szczycie swojej gry — „to moje".
import React from 'react';
import { Keyword, HighlightBox } from '../components/Text';
import { Card } from '../components/UI';
import { GameScreen } from '../components/GameScreen';
import { Clawd } from '../components/Clawd';
import { TOOLS } from '../components/props';
import { C, fit } from '../lib/theme';
import { prog, clamp, lerp, expoOut, cubicOut, cubicInOut, backOut, pulse, blurIn, blurOut } from '../lib/anim';

// ——— oś czasu (s) ———
const T = {
  line: 0.05, copies: [0.16, 0.32, 0.48], look: 0.6, shake: [0.72, 1.1], strike: 1.12, shove: 1.26,
  lineOut: 1.52, rise: 1.56, jump: 1.5, jumpDur: 0.42, hb: 1.66, key: 2.06, raise: 2.18, plant: 2.4, cheer: 2.58, hop: 2.86,
};
const LANDT = T.jump + T.jumpDur;          // 1.92

// ——— geometria ———
const STACK = { x: 96, y: 740, w: 560, dx: 34, dy: -34 };    // przednia kopia; kolejne przesunięte w prawo-górę
const SSH = STACK.w * 0.6, SCH = 58 + SSH;                   // 336, 394
const CL1 = { x: 836, y: 1134, u: 12 };                      // Clawd obok stosu (tylna kopia kończy się na x 724)
const MY = { x: 150, y: 810, w: 720 };                       // „moja-gra"
const MSH = MY.w * 0.6, MCH = 58 + MSH;                      // 432, 490
const CL2 = { x: 640, y: MY.y, u: 12 };                      // Clawd na karcie
const POLE = { x: 770, u: 12, h: 14 };                       // flaga wbita w kartę (x lewej krawędzi drzewca)

// klocki wieży z S10 (ciągłość) — siatka gry 40×24
const BLK = { grass: { top: '#5BC46A', side: '#A86B3C', h: 0.7 }, stone: { top: '#9A9AA0', side: '#7D7D84', h: 2 }, wood: { top: '#B07A45', side: '#8E5F33', h: 2 } };
const Tower = () => (
  <>
    {['stone', 'wood', 'grass'].map((type, j) => [26, 28].map((x) => {
      const y = 7 - 2 * (j + 1), b = BLK[type];
      return (
        <g key={type + x}>
          <rect x={x} y={y} width={2.02} height={2.02} fill={b.side} />
          <rect x={x} y={y} width={2.02} height={b.h} fill={b.top} />
          {type === 'wood' && <rect x={x} y={y + 0.95} width={2.02} height={0.12} fill="#7A5230" />}
          <rect x={x} y={y} width={2} height={2} fill="none" stroke="rgba(0,0,0,.3)" strokeWidth={0.12} />
        </g>
      );
    }))}
  </>
);

// linia „nie powtarzasz cudzej gry" z przekreśleniem dwóch ostatnich słów
const StrikeLine = ({ t, y }) => {
  const words = [['nie', 0], ['powtarzasz', 0], ['cudzej', 1], ['gry', 1]];
  const fs = Math.min(64, fit('nie powtarzasz cudzej gry', 700, 64, 840, -0.02));
  const k = expoOut(prog(t, T.strike, 0.26));
  const dim = 1 - 0.5 * prog(t, T.strike + 0.1, 0.25);
  const W = (w, i) => <span key={i} style={{ display: 'inline-block', fontWeight: w[1] ? 700 : 400, ...blurIn(t, T.line + i * 0.09) }}>{w[0]}</span>;
  return (
    <div style={{ position: 'absolute', left: 510 - 540, width: 1080, top: y, textAlign: 'center', fontSize: fs, lineHeight: 1.15, letterSpacing: '-0.02em', color: C.ink, whiteSpace: 'nowrap' }}>
      {W(words[0], 0)} {W(words[1], 1)}{' '}
      <span style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ opacity: dim }}>{W(words[2], 2)} {W(words[3], 3)}</span>
        {k > 0 && <span style={{ position: 'absolute', left: -10, top: '50%', height: fs * 0.15, width: `calc(${(k * 100).toFixed(1)}% + ${(20 * k).toFixed(1)}px)`,
          background: C.accent, borderRadius: fs * 0.08, transform: 'rotate(-4deg)', transformOrigin: '0% 50%' }} />}
      </span>
    </div>
  );
};

// duża pikselowa flaga (drzewce + falujące płótno w kolorze Clawda)
const BigFlag = ({ t, x, base, u, h, drop = 0, squash = 0 }) => {
  const cols = 9;
  return (
    <svg width={(cols + 1) * u} height={h * u} viewBox={`0 0 ${cols + 1} ${h}`} shapeRendering="crispEdges"
      style={{ position: 'absolute', left: x, top: base - h * u - drop, overflow: 'visible', transform: `scale(${1 + squash * 0.4}, ${1 - squash})`, transformOrigin: '6% 100%' }}>
      <rect x={0} y={0} width={1.02} height={h} fill="#2B2B2E" />
      <rect x={-0.2} y={-0.8} width={1.4} height={1} fill="#F6C343" />
      {Array.from({ length: cols }).map((_, c) => {
        const dy = Math.round(Math.sin(t * 9 - c * 0.9) * 0.6 * (c / cols + 0.3) * 2) / 2;
        return (
          <g key={c}>
            <rect x={1 + c} y={0.6 + dy} width={1.02} height={4.4} fill={C.accent} />
            <rect x={1 + c} y={4.2 + dy} width={1.02} height={0.8} fill={C.accentDeep} />
          </g>
        );
      })}
    </svg>
  );
};

// iskierki 4-ramienne (jak w S09)
const Sparkle = ({ x, y, s }) => (
  <path transform={`translate(${x} ${y})`} d={`M0 ${-26 * s} L${5 * s} ${-5 * s} L${26 * s} 0 L${5 * s} ${5 * s} L0 ${26 * s} L${-5 * s} ${5 * s} L${-26 * s} 0 L${-5 * s} ${-5 * s} Z`} fill="#FFFFFF" stroke="#1B1B1D" strokeWidth={3} />
);

// kurz przy wbiciu flagi
const Dust = ({ t, at, x, y }) => {
  const dt = t - at; if (dt < 0 || dt > 0.32) return null; const k = dt / 0.32;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} shapeRendering="crispEdges">
      {Array.from({ length: 6 }).map((_, i) => {
        const side = i < 3 ? -1 : 1, j = i % 3, v = [200, 340, 470][j], up = [330, 140, 240][j], s = [18, 15, 12][j] * (1 - k * 0.5);
        const px = x + side * (16 + j * 18 + v * dt), py = y - j * 8 - up * dt + 1000 * dt * dt;
        return <rect key={i} x={px - s / 2} y={py - s / 2} width={s} height={s} fill="#FFFFFF" stroke="#1B1B1D" strokeWidth={2.5} opacity={1 - k * 0.4} />;
      })}
    </svg>
  );
};

function clawdState(t) {
  const flagHand = { ...TOOLS.flag, px: 1.7 };
  if (t < T.jump) {                                    // A: obok stosu kopii — „nie" i odepchnięcie
    const d = prog(t, 0.08, 0.36);
    const lift = d < 1 ? (1 - backOut(d, 1.3)) * 30 : 0;
    const shaking = t > T.shake[0] && t < T.shake[1];
    const look = shaking ? (Math.floor(t * 12) % 2 ? -1 : 1) : t > T.look ? -1 : 0;
    const push = t > T.shove - 0.08 && t < T.shove + 0.14;
    const lunge = pulse(t, T.shove - 0.08, 0.24) * -32;
    const crouch = clamp((t - (T.jump - 0.12)) / 0.1);
    const wob = shaking ? (Math.floor(t * 12) % 2 ? -5 : 5) : 0;     // „nie" — kręci całym sobą
    return { x: CL1.x + lunge, y: CL1.y, u: CL1.u, lift, opacity: clamp(d * 5), flip: push, arms: push ? 'reach' : 'down', look: push ? 1 : look, rot: wob,
      squash: pulse(t, 0.44, 0.22) * 0.2 - (d < 1 ? 0.08 : 0) + (push ? -0.06 : 0) + crouch * 0.2 };
  }
  if (t < LANDT) {                                     // wskok na własną grę, flaga w dłoni
    const k = prog(t, T.jump, T.jumpDur);
    return { x: lerp(CL1.x, CL2.x, k), y: lerp(CL1.y, CL2.y, k) - Math.sin(Math.PI * k) * 160, u: CL1.u, lift: 0, squash: -0.12,
      arms: 'rightUp', look: -1, hold: { ...flagHand, px: flagHand.px * (0.4 + 0.6 * backOut(prog(t, T.jump, 0.2), 2)) } };
  }
  // B: na karcie — unosi flagę, wbija, cieszy się
  const raise = t > T.raise && t < T.plant - 0.06;
  const slam = t >= T.plant - 0.06 && t < T.plant + 0.12;
  const held = t < T.plant;
  const hopL = pulse(t, T.raise, T.plant - 0.06 - T.raise) * 3.2 + pulse(t, T.hop, 0.3) * 3 + pulse(t, T.cheer + 0.02, 0.24) * 1.5;
  const arms = held ? (slam ? 'down' : 'rightUp') : t > T.cheer ? 'up' : 'down';
  return { x: CL2.x, y: CL2.y, u: CL2.u, lift: hopL, flip: false,
    squash: pulse(t, LANDT, 0.22) * 0.24 + pulse(t, T.plant, 0.16) * 0.2 + pulse(t, T.hop + 0.3, 0.16) * 0.18,
    arms, look: t > T.cheer && t < T.hop ? 1 : t > T.hop + 0.15 ? (Math.floor(t * 3) % 2 ? 0 : 1) : 1,
    hold: held ? { ...flagHand, rot: raise ? -8 : slam ? 30 : 0 } : null };
}

export default function S11({ t }) {
  const cs = clawdState(t);

  // A: kopie cudzej gry; odepchnięte lecą w lewo
  const copies = T.copies.map((at, i) => {
    const j = 2 - i;                                    // i=0 — tylna (pierwsza wklejona)
    const x = STACK.x + j * STACK.dx, y = STACK.y + j * STACK.dy;
    const p = prog(t, at, 0.3), pop = p > 0 ? 0.82 + 0.18 * backOut(p, 2.6) : 0.82;
    const f = prog(t, T.shove + i * 0.035, 0.34), fe = f * (0.45 + 0.55 * f);
    return { i, x, y, at, style: { position: 'absolute', inset: 0, opacity: clamp(p * 5) * (1 - clamp((f - 0.6) / 0.4)),
      transformOrigin: `${x + STACK.w / 2}px ${y + SCH / 2}px`,
      transform: `translate(${(-820 * fe).toFixed(1)}px, ${(70 * fe).toFixed(1)}px) rotate(${(-16 * fe).toFixed(2)}deg) scale(${pop})`,
      filter: `saturate(0.3)${f > 0 ? ` blur(${(f * 10).toFixed(2)}px)` : ''}` } };
  });

  // B: własna gra wjeżdża od dołu, drży przy wbiciu flagi
  const r = cubicOut(prog(t, T.rise, 0.46));
  const shake = pulse(t, T.plant, 0.14) * 9;
  const myY = lerp(1320, MY.y, r) + shake;
  const flagOn = t >= T.plant;
  const fd = prog(t, T.plant, 0.09);
  const sp = prog(t, T.plant + 0.02, 0.42), glint = pulse(t, 2.95, 0.26);

  return (
    <>
      {/* A: linia z przekreśleniem */}
      {t < T.lineOut + 0.35 && <div style={{ position: 'absolute', inset: 0, ...(t > T.lineOut ? blurOut(t, T.lineOut) : {}) }}>
        <StrikeLine t={t} y={282} />
      </div>}

      {/* B: tylko budujesz / WŁASNĄ */}
      {t > T.hb && <HighlightBox t={t} at={T.hb} text="tylko budujesz" size={66} y={276} />}
      {t > T.key && <Keyword t={t} at={T.key} text="WŁASNĄ" y={392} max={200} />}

      {/* A: stos kopii */}
      {t < T.shove + 0.6 && copies.map((c) => t > c.at && (
        <div key={c.i} style={c.style}>
          <Card t={9} at={0} x={c.x} y={c.y} w={STACK.w} h={SCH} title="cudza-gra"><GameScreen variant="color" t={t} w={STACK.w} h={SSH} /></Card>
        </div>
      ))}

      {/* B: moja gra (miasto z klocków + wieża) */}
      {t > T.rise && <div style={{ position: 'absolute', inset: 0, opacity: clamp(prog(t, T.rise, 0.2) * 1.5), filter: r < 0.7 ? `blur(${((1 - r / 0.7) * 10).toFixed(2)}px)` : undefined }}>
        <Card t={9} at={0} x={MY.x} y={myY} w={MY.w} h={MCH} title="moja-gra">
          <GameScreen variant="merged" t={t + 1.5} w={MY.w} h={MSH} />
          <svg width={MY.w} height={MSH} viewBox="0 0 40 24" shapeRendering="crispEdges" style={{ position: 'absolute', left: 0, top: 0 }}><Tower /></svg>
        </Card>
      </div>}

      {/* flaga wbita w kartę */}
      {flagOn && <BigFlag t={t} x={POLE.x} base={myY + 8} u={POLE.u} h={POLE.h} drop={(1 - expoOut(fd)) * 70} squash={pulse(t, T.plant + 0.06, 0.16) * 0.12} />}
      <Dust t={t} at={T.plant + 0.06} x={POLE.x + 6} y={MY.y} />
      {((sp > 0 && sp < 1) || glint > 0) && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
          {sp > 0 && sp < 1 && [[-70, -150, 1], [150, -170, 0.8], [180, -40, 0.65]].map(([dx, dy, s], i) =>
            <Sparkle key={i} x={POLE.x + dx * (0.8 + 0.2 * sp)} y={MY.y + dy - 20 * sp} s={Math.sin(sp * Math.PI) * s * 1.1} />)}
          {glint > 0 && <Sparkle x={POLE.x + 6} y={MY.y - POLE.h * POLE.u - 4} s={glint * 0.9} />}
        </svg>
      )}

      {/* Clawd */}
      <Clawd x={cs.x} y={cs.y} u={cs.u} t={t} lift={cs.lift} squash={cs.squash} arms={cs.arms} look={cs.look} flip={!!cs.flip} hold={cs.hold || null} rot={cs.rot || 0} opacity={cs.opacity ?? 1} />
    </>
  );
}
