// S10 — „a nawet łączy dwie gry w jedną, na przykład miasto z GTA z budowaniem z Minecrafta."
// A (0–3.5 s): „a nawet łączy" → 2 GRY W 1. Dwie gry obok siebie: miasto (auto jedzie) i klocki (budowla rośnie),
//   między nimi „+". Clawd wskazuje kolejno: lewą ręką miasto (chip „miasto z GTA"), prawą klocki (chip „budowanie z Minecrafta").
// B (3.5–4.3 s): karty zjeżdżają się z przyspieszeniem i „sklejają" (rozmycie, błysk, odłamki pikseli) w jedną dużą
//   kartę „moja-gra" — miasto z klocków. Clawd wybija się i wskakuje DO nowej gry, na dach.
// C (4.3–5.9 s): Clawd buduje po minecraftowemu: skok → klocek pod nogi (3 warstwy), na końcu radość na szczycie wieży.
// Chipy zostają pod nową kartą z „+" między nimi (miasto z GTA + budowanie z Minecrafta).
import React from 'react';
import { Words, Keyword } from '../components/Text';
import { Card, Connector } from '../components/UI';
import { GameScreen } from '../components/GameScreen';
import { Clawd } from '../components/Clawd';
import { C, fit } from '../lib/theme';
import { prog, clamp, lerp, expoOut, cubicOut, cubicInOut, backOut, pulse, blurOut } from '../lib/anim';

// ——— oś czasu (s) ———
const T = {
  line: 0.05, key: 0.4, drop: 0.15, cardA: 0.85, cardB: 1.15, plus: 1.5, lineOut: 2.05,
  conA: 2.2, chipA: 2.45, conB: 2.9, chipB: 3.15, crouch: 3.66, merge: 3.58, mergeDur: 0.44,
  jump: 3.86, jumpDur: 0.42, plusAgain: 4.36, pillars: [4.48, 4.84, 5.2], pillarDur: 0.28,
};
const HIT = T.merge + T.mergeDur;          // 4.02 — moment sklejenia
const LAND = T.jump + T.jumpDur;           // 4.32 — Clawd na dachu

// ——— geometria ———
const SH = 228, CH = 58 + SH;               // małe karty 380×286 (ekran 5:3)
const A = { x: 85, y: 540, w: 380 }, B = { x: 555, y: 540, w: 380 };
const M = { x: 80, y: 500, w: 860 };        // karta po połączeniu
const MU = M.w / 40, MST = M.y + 58, MH = 58 + 24 * MU;   // jednostka siatki gry (21.5 px), góra ekranu gry, wysokość (574)
const MC = { x: M.x + M.w / 2, y: M.y + MH / 2 };         // środek (510, 787)
const CHIP = { w: 380, y: 1108, cxA: 275, cxB: 745 };     // chipy pod kartami (stałe; po sklejeniu pod nową kartą)
const BIG = { x: 510, y: 1050, u: 12 };                   // Clawd pod „+", między łącznikami
const TOWER = { ux: 26, roof: 7 };                         // wieża na dachu budynku [26,7,5] (klocki 26–30)
const IN = { x: M.x + (TOWER.ux + 2) * MU, u: 9 };         // Clawd w grze: x 682
const feetAt = (lvl) => MST + (TOWER.roof - 2 * lvl) * MU; // 708.5, 665.5, 622.5, 579.5
const LAYERS = ['stone', 'wood', 'grass'];

// klocek w stylu GameScreen 'blocks' (jednostki siatki gry 40×24)
const BLK = {
  grass: { top: '#5BC46A', side: '#A86B3C', h: 0.7 }, stone: { top: '#9A9AA0', side: '#7D7D84', h: 2 }, wood: { top: '#B07A45', side: '#8E5F33', h: 2 },
};
const Block = ({ x, y, type, k = 1 }) => {
  const b = BLK[type];
  return (
    <g transform={`translate(${x + 1} ${y + 2}) scale(${k}) translate(${-1} ${-2})`}>
      <rect x={0} y={0} width={2.02} height={2.02} fill={b.side} />
      <rect x={0} y={0} width={2.02} height={b.h} fill={b.top} />
      {type === 'grass' && <rect x={0.3} y={0.7} width={0.4} height={0.4} fill={b.top} />}
      {type === 'stone' && <rect x={1.1} y={0.4} width={0.5} height={0.4} fill="#B4B4BA" />}
      {type === 'wood' && <rect x={0} y={0.95} width={2.02} height={0.12} fill="#7A5230" />}
      <rect x={0} y={0} width={2} height={2} fill="none" stroke="rgba(0,0,0,.3)" strokeWidth={0.12} />
    </g>
  );
};
// klocek w dłoni Clawda (siatka w jednostkach Clawda)
const HELD = {
  grass: { grid: ['gggg', 'gdgd', 'dddd', 'dddd'], palette: { g: '#5BC46A', d: '#A86B3C' } },
  stone: { grid: ['ssss', 'slss', 'ssss', 'ssls'], palette: { s: '#9A9AA0', l: '#B4B4BA' } },
  wood: { grid: ['wwww', 'wwww', 'kkkk', 'wwww'], palette: { w: '#B07A45', k: '#7A5230' } },
};

// etykieta dwuwierszowa (jak Chip, ale stała szerokość): mały opis + nazwa gry
const Label = ({ t, at, cx, y, top, main }) => {
  const p = prog(t, at, 0.45), s = p > 0 ? 0.6 + 0.4 * backOut(p, 2.2) : 0.6;
  const ms = Math.min(58, fit(main, 700, 58, CHIP.w - 48, -0.025));
  return (
    <div style={{ position: 'absolute', left: cx - CHIP.w / 2, top: y, width: CHIP.w, padding: '18px 0 22px', borderRadius: 28, background: C.card, color: '#fff', textAlign: 'center',
      boxShadow: '0 20px 40px rgba(0,0,0,.22)', transform: `scale(${s})`, transformOrigin: '50% 0%', opacity: clamp(p * 4), whiteSpace: 'nowrap' }}>
      <div style={{ fontSize: 44, fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'rgba(255,255,255,.7)' }}>{top}</div>
      <div style={{ fontSize: ms, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em' }}>{main}</div>
    </div>
  );
};

// pikselowy plus (tusz)
const Plus = ({ x, y, s = 1, rot = 0, opacity = 1 }) => (
  <svg width={64} height={64} shapeRendering="crispEdges" style={{ position: 'absolute', left: x - 32, top: y - 32, transform: `rotate(${rot}deg) scale(${s})`, opacity, overflow: 'visible' }}>
    <rect x={0} y={23} width={64} height={18} fill={C.ink} /><rect x={23} y={0} width={18} height={64} fill={C.ink} />
  </svg>
);

// odłamki pikseli przy sklejeniu (deterministyczne)
const DEBRIS = ['#5BC46A', '#A86B3C', '#4B5D73', '#FFE08A', '#9A9AA0', '#E3473E', '#8ED3FF', '#B07A45'];
const Debris = ({ t }) => {
  const dt = t - HIT; if (dt < 0 || dt > 0.42) return null;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} shapeRendering="crispEdges">
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 + 0.2 + ((i * 53) % 7) * 0.07, v = 820 + ((i * 7) % 5) * 300;
        const ex = Math.cos(a) * v * dt, ey = Math.sin(a) * v * dt * 0.8 + 1800 * dt * dt;
        const s = (i % 3 ? 28 : 38) * (1 - dt / 0.62);
        return <rect key={i} x={MC.x + ex - s / 2} y={MC.y + ey - s / 2} width={s} height={s} fill={DEBRIS[i % DEBRIS.length]} stroke="#1B1B1D" strokeWidth={2} opacity={1 - clamp((dt - 0.25) / 0.17)} />;
      })}
    </svg>
  );
};

// puch przy postawieniu klocka (białe piksele na boki)
const Puff = ({ t, at, x, y }) => {
  const dt = t - at; if (dt < 0 || dt > 0.3) return null; const k = dt / 0.3;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} shapeRendering="crispEdges">
      {Array.from({ length: 6 }).map((_, i) => {
        const side = i < 3 ? -1 : 1, j = i % 3, v = [160, 300, 440][j], up = [320, 120, 230][j], s = [20, 16, 14][j] * (1 - k * 0.5);
        const px = x + side * (48 + j * 26 + v * dt), py = y - j * 12 - up * dt + 900 * dt * dt;
        return <rect key={i} x={px - s / 2} y={py - s / 2} width={s} height={s} fill="#FFFFFF" stroke="#1B1B1D" strokeWidth={2.5} opacity={1 - k * 0.4} />;
      })}
    </svg>
  );
};

// stan Clawda
function clawdState(t) {
  if (t < T.jump) {                                      // A: przed kartami — wskazuje gry
    const d = prog(t, T.drop, 0.4);
    const lift = d < 1 ? (1 - backOut(d, 1.3)) * 40 : 0;
    const hop = pulse(t, T.plus, 0.34) * 3;
    const crouch = clamp((t - T.crouch) / 0.16) * (t < T.jump ? 1 : 0);
    let arms = 'down', look = 0;
    if (t > T.cardA && t < T.cardB) look = -1;
    if (t > T.cardB && t < T.plus) look = 1;
    if (t > T.plus - 0.02 && t < T.plus + 0.36) arms = 'up';
    if (t > T.chipA - 0.06 && t < T.chipB - 0.06) { arms = 'leftUp'; look = -1; }
    if (t > T.chipB - 0.06 && t < T.crouch) { arms = 'rightUp'; look = 1; }
    return { ...BIG, lift: lift + hop, opacity: clamp(d * 5), arms, look,
      squash: pulse(t, T.drop + 0.42, 0.24) * 0.22 - (d < 1 ? 0.08 : 0) + pulse(t, T.chipA, 0.2) * 0.08 + pulse(t, T.chipB, 0.2) * 0.08 + crouch * 0.2 };
  }
  if (t < LAND) {                                        // B: wyskok do nowej gry (maleje do skali świata gry)
    const k = prog(t, T.jump, T.jumpDur);
    return { x: lerp(BIG.x, IN.x, k), y: lerp(BIG.y, feetAt(0), k) - Math.sin(Math.PI * k) * 170, u: lerp(BIG.u, IN.u, cubicOut(k)),
      lift: 0, squash: -0.12, arms: 'up', look: 1 };
  }
  // C: wieża z klocków — skok, klocek pod nogi
  let lvl = 0, y = feetAt(0), arms = 'down', held = LAYERS[0], squash = pulse(t, LAND, 0.2) * 0.24;
  T.pillars.forEach((at, j) => {
    const p = prog(t, at, T.pillarDur);
    if (p >= 1) { lvl = j + 1; }
    else if (p > 0) {
      y = lerp(feetAt(j), feetAt(j + 1), p) - 4 * 62 * p * (1 - p);
      arms = 'up'; held = p < 0.38 ? LAYERS[j] : null; squash = -0.1;
    }
    squash += pulse(t, at + T.pillarDur, 0.16) * 0.22 + pulse(t, at - 0.1, 0.1) * 0.16;
  });
  const jumping = T.pillars.some((at) => t > at && t < at + T.pillarDur);
  if (!jumping) {
    y = feetAt(lvl);
    const last = T.pillars[T.pillars.length - 1] + T.pillarDur;
    held = lvl < LAYERS.length && t > (lvl ? T.pillars[lvl - 1] + T.pillarDur + 0.06 : LAND + 0.06) ? LAYERS[lvl] : null;
    if (t > last) { arms = 'up'; held = null; y -= Math.abs(Math.sin((t - last) * 9)) * 16; }
  }
  return { x: IN.x, y, u: IN.u, lift: 0, squash, arms, look: 0, held };
}

export default function S10({ t }) {
  // tekst
  const keyY = lerp(352, 286, cubicInOut(prog(t, T.lineOut, 0.4)));
  const keyPop = pulse(t, HIT, 0.3);

  // sklejanie kart (przyspiesza)
  const m = prog(t, T.merge, T.mergeDur), e = m * m * m;
  const cardStyle = (side) => {
    const c = side < 0 ? A : B, cx = c.x + c.w / 2, cy = c.y + CH / 2;
    return { position: 'absolute', inset: 0, transformOrigin: `${cx}px ${cy}px`,
      transform: `translate(${((MC.x - cx) * e).toFixed(1)}px, ${((MC.y - cy) * e).toFixed(1)}px) rotate(${(-side * 7 * e).toFixed(2)}deg) scale(${1 + 0.28 * e + 0.05 * pulse(t, side < 0 ? T.chipA : T.chipB, 0.3)})`,
      filter: e > 0.01 ? `blur(${(e * 9).toFixed(2)}px)` : undefined };
  };
  const pm = prog(t, HIT, 0.42);
  const mergedStyle = { position: 'absolute', inset: 0, transformOrigin: `${MC.x}px ${MC.y}px`,
    transform: `scale(${0.6 + 0.4 * (pm > 0 ? backOut(pm, 1.5) : 0)})`, filter: pm < 0.6 ? `blur(${((1 - pm / 0.6) * 12).toFixed(2)}px)` : undefined, opacity: clamp(pm * 6) };

  const chipY = CHIP.y;
  // „+" między kartami → wchłonięty przy sklejeniu → wraca między chipami
  const plusOut = prog(t, T.merge, 0.2);
  const plusP = t < HIT ? prog(t, T.plus, 0.4) : prog(t, T.plusAgain, 0.4);
  const plusS = (t < HIT ? (1 - cubicOut(plusOut)) : 1) * (plusP > 0 ? 0.3 + 0.7 * backOut(plusP, 2.4) : 0);
  const plusY = t < HIT ? A.y + CH / 2 : chipY + 76;
  const placed = 6 + Math.floor(14 * prog(t, 1.45, 1.9));

  const cs = clawdState(t);
  const HB = cs.held ? { ...HELD[cs.held], px: 1, ax: 0, ay: 2 } : null;

  return (
    <>
      {/* nagłówek */}
      {t < T.lineOut + 0.35 && <div style={{ position: 'absolute', inset: 0, ...(t > T.lineOut ? blurOut(t, T.lineOut) : {}) }}>
        <Words t={t} at={T.line} text="a nawet łączy" size={60} y={276} />
      </div>}
      <div style={{ position: 'absolute', inset: 0, transformOrigin: `510px ${keyY + 75}px`, transform: `scale(${1 + 0.07 * keyPop})` }}>
        <Keyword t={t} at={T.key} text="2 GRY W 1" y={keyY} max={150} />
      </div>

      {/* A: dwie gry obok siebie */}
      {t < HIT && <>
        <div style={cardStyle(-1)}>
          <Card t={t} at={T.cardA} x={A.x} y={A.y} w={A.w} h={CH} title="gra-1"><GameScreen variant="city" t={t} w={A.w} h={SH} /></Card>
        </div>
        <div style={cardStyle(1)}>
          <Card t={t} at={T.cardB} x={B.x} y={B.y} w={B.w} h={CH} title="gra-2"><GameScreen variant="blocks" t={t} w={B.w} h={SH} placed={placed} /></Card>
        </div>
      </>}

      {/* B/C: jedna gra — miasto z klocków + wieża Clawda */}
      {t >= HIT && <div style={mergedStyle}>
        <Card t={t} at={-5} x={M.x} y={M.y} w={M.w} h={MH} title="moja-gra"><GameScreen variant="merged" t={t} w={M.w} h={MH - 58} /></Card>
        <svg width={M.w} height={MH - 58} viewBox="0 0 40 24" shapeRendering="crispEdges" style={{ position: 'absolute', left: M.x, top: MST, overflow: 'visible' }}>
          {LAYERS.map((type, j) => {
            const at = T.pillars[j] + T.pillarDur * 0.38; const k = prog(t, at, 0.14);
            if (k <= 0) return null;
            const s = 0.45 + 0.55 * backOut(k, 2.4);
            return [0, 2].map((dx) => <Block key={j + '-' + dx} x={TOWER.ux + dx} y={TOWER.roof - 2 * (j + 1)} type={type} k={s} />);
          })}
        </svg>
        <div style={{ position: 'absolute', left: M.x, top: M.y, width: M.w, height: MH, borderRadius: 34, background: '#FFFFFF', opacity: 0.9 * (1 - cubicOut(prog(t, HIT, 0.34))) }} />
      </div>}
      <Debris t={t} />

      {/* łączniki kart → chipy (znikają przy sklejaniu) */}
      {t < T.merge + 0.3 && <div style={{ position: 'absolute', inset: 0, ...(t > T.merge ? blurOut(t, T.merge, { dur: 0.25 }) : {}) }}>
        {t > T.conA && <Connector t={t} at={T.conA} dur={0.36} x1={A.x + A.w / 2} y1={A.y + CH} x2={CHIP.cxA} y2={CHIP.y - 6} bend={34} />}
        {t > T.conB && <Connector t={t} at={T.conB} dur={0.36} x1={B.x + B.w / 2} y1={B.y + CH} x2={CHIP.cxB} y2={CHIP.y - 6} bend={-34} />}
      </div>}

      {/* chipy: nazwy gier */}
      {t > T.chipA && <Label t={t} at={T.chipA} cx={CHIP.cxA} y={chipY} top="miasto z" main="GTA" />}
      {t > T.chipB && <Label t={t} at={T.chipB} cx={CHIP.cxB} y={chipY} top="budowanie z" main="Minecrafta" />}
      {plusS > 0.01 && <Plus x={510} y={plusY} s={plusS} rot={plusP >= 0.99 && (t >= HIT || plusOut === 0) ? 0 : (1 - expoOut(plusP)) * 90 + (t < HIT ? plusOut * 90 : 0)} opacity={clamp(plusP * 4)} />}

      {/* puch przy każdym klocku */}
      {T.pillars.map((at) => <Puff key={at} t={t} at={at + T.pillarDur * 0.38} x={IN.x} y={feetAt(T.pillars.indexOf(at) + 1) + 20} />)}

      {/* Clawd (+ cień na „podłodze" w części A) */}
      {t < T.jump + 0.12 && <div style={{ position: 'absolute', left: BIG.x - 80, top: BIG.y - 4, width: 160, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,.16)', filter: 'blur(4px)',
        opacity: clamp(prog(t, T.drop, 0.4) * 3) * (1 - prog(t, T.jump, 0.12)), transform: `scaleX(${1 - Math.min(0.5, (cs.lift || 0) / 30 + (t > T.jump ? 0.4 : 0))})` }} />}
      <Clawd x={cs.x} y={cs.y} u={cs.u} t={t} lift={cs.lift} squash={cs.squash} arms={cs.arms} look={cs.look} hold={HB} opacity={cs.opacity ?? 1} />
    </>
  );
}
