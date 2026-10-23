// S13 — „U mnie ta sama zasada działa w OpenCode, bo każdy skill ma tam jedną rolę, więc AI się nie gubi." (ostatnia scena)
// Clawd jako dyrygent na pikselowym podeście: batutą „przywołuje" kolumnę skilli (ciemne chipy), potem wskazuje je po kolei —
// z każdego chipa wyrasta przerywana strzałka do JEDNEJ roli (jasny kafel z pikselową ikoną; kolor kwadracika w chipie = kolor ikony).
// Belka „AI się nie gubi" → finał: chipy znikają, role zjeżdżają w jeden rząd, Clawd zeskakuje na środek i macha na pożegnanie.
import React from 'react';
import { Words, Keyword, HighlightBox } from '../components/Text';
import { Clawd } from '../components/Clawd';
import { PixelArt } from '../components/Pixel';
import { C } from '../lib/theme';
import { prog, clamp, lerp, expoOut, cubicOut, cubicInOut, backOut, pulse, popIn, blurOut } from '../lib/anim';

// ——— ikony ról (pixel-art) ———
const ICONS = {
  magni: { grid: ['..kkkk....', '.kbbbbk...', 'kbwbbbbk..', 'kbwbbbbk..', 'kbbbbbbk..', 'kbbbbbbk..', '.kbbbbk...', '..kkkkkk..', '......kkk.', '.......kkk'],
    palette: { k: '#1B1B1D', b: '#3E7BFA', w: '#FFFFFF' }, unit: 7.4 },
  swatch: { grid: ['bbbb.yyyy', 'bbbb.yyyy', 'bbbb.yyyy', 'bbbb.yyyy', '.........', 'gggg.rrrr', 'gggg.rrrr', 'gggg.rrrr', 'gggg.rrrr'],
    palette: { b: '#3E7BFA', y: '#F6C343', g: '#5BC46A', r: '#E3473E' }, unit: 7.6 },
  rack: { grid: ['kkkkkkk', 'kGkLLLk', 'kkkkkkk', 'kHkLLLk', 'kkkkkkk', 'kIkLLLk', 'kkkkkkk', 'k.....k'], unit: 8.6 },
  pad: { grid: ['.kkkk..kkkk.', 'kkkkkkkkkkkk', 'kkwkkkkkkrkk', 'kwwwkkkkrkrk', 'kkwkkkkkkrkk', 'kkkkkkkkkkkk', 'kkk......kkk'],
    palette: { k: '#1B1B1D', w: '#F2F2F2', r: '#E3473E' }, unit: 6.8 },
  hammer: { grid: ['.kkkkkkk.', 'kkkkkkkkk', 'kkkkkkkkk', '.kkkkkkk.', '...hhh...', '...hhh...', '...hhh...', '...hhh...', '...hhh...'],
    palette: { k: '#3A3A3F', h: '#B07A45' }, unit: 7.2, rot: -32 },
};
const ROWS = [
  { name: 'mechanika', col: '#3E7BFA', icon: 'magni' },
  { name: 'grafika', col: '#F6C343', icon: 'swatch' },
  { name: 'backend', col: '#5BC46A', icon: 'rack' },
  { name: 'kontroler', col: '#E3473E', icon: 'pad' },
  { name: 'mody', col: '#B07A45', icon: 'hammer' },
];

// ——— oś czasu ———
const CHIPS = 1.5, CHIP_STEP = 0.12;        // chipy-skille wchodzą po kolei (Clawd „przywołuje" je batutą)
const R0 = 2.62, RS = 0.4;                  // wiersz i: strzałka + rola
const rowAt = (i) => R0 + i * RS;
const FLOURISH = 4.62, BAR_AT = 4.95, COLLAPSE = 5.55, JUMP = 5.98, JUMP_DUR = 0.4, WAVE = 6.5;

// ——— układ ———
const D = { y0: 630, pitch: 104, chipX: 100, chipW: 340, chipH: 88, ax1: 458, ax2: 580, tileX: 596, tile: 88 };
const rowC = (i) => D.y0 + i * D.pitch + D.chipH / 2;
const POD = { x: 754, w: 164, top: 950, bottom: 1134 };
const CX = 836, CF = POD.top, CU = 10;          // Clawd-dyrygent
const FIN = { x: 510, f: 1132, u: 17 };         // Clawd w kadrze końcowym
const ROW = { y: 690, s: 120, gap: 24 };        // role w jednym rzędzie (finał)
const BAR_Y = 1206;

// batuta (pionowo, chwyt na dole)
const BATON = { grid: ['k', 'k', 'k', 'k', 'k', 'k', 'h', 'h'], palette: { k: '#1B1B1D', h: '#B07A45' }, px: 1.05, ax: 0, ay: 7 };
const HAND_UP = [17, 0.5], HAND_REACH = [18, 5];
// kąt batuty (stopnie, w układzie Clawda odbitego w lewo), by wskazywała punkt (px, py)
const aimAt = (hand, px, py, lift = 0) => {
  const hx = CX - (hand[0] - 9) * CU, hy = CF + (hand[1] - 10 - lift) * CU;
  return (Math.atan2(-(px - hx), -(py - hy)) * 180) / Math.PI;
};

const rack = (t) => {
  const on = (j) => (Math.floor(t * 7 + j * 2.3) % 3) !== 0;
  return { k: '#2B2B2E', L: '#55555A', G: on(0) ? '#5BC46A' : '#2F4A35', H: on(1) ? '#5BC46A' : '#2F4A35', I: on(2) ? '#F6C343' : '#4A4130' };
};

const Icon = ({ name, t }) => {
  const I = ICONS[name];
  const pal = name === 'rack' ? rack(t) : I.palette;
  return <PixelArt grid={I.grid} palette={pal} unit={I.unit} style={{ transform: I.rot ? `rotate(${I.rot}deg)` : undefined }} />;
};

const SkillChip = ({ t, at, i, style = {} }) => {
  const p = prog(t, at, 0.45), s = p > 0 ? 0.6 + 0.4 * backOut(p, 2.2) : 0.6;
  return (
    <div style={{ position: 'absolute', left: D.chipX, top: D.y0 + i * D.pitch, width: D.chipW, height: D.chipH, borderRadius: 22, background: C.card,
      display: 'flex', alignItems: 'center', gap: 20, padding: '0 0 0 28px', boxSizing: 'border-box', color: '#fff', fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em',
      boxShadow: '0 18px 36px rgba(0,0,0,.22)', opacity: clamp(p * 4), transform: `scale(${s})`, transformOrigin: '0% 50%', filter: `blur(${((1 - expoOut(p)) * 8).toFixed(2)}px)`, ...style }}>
      <span style={{ width: 26, height: 26, background: ROWS[i].col, flex: 'none' }} />{ROWS[i].name}
    </div>
  );
};

// przerywana strzałka rysowana od lewej
const DashArrow = ({ t, at, x1, x2, y, dur = 0.24 }) => {
  const p = cubicOut(prog(t, at, dur)); if (p <= 0) return null;
  const xe = lerp(x1, x2, p);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <line x1={x1 + 8} y1={y} x2={xe - 8} y2={y} stroke={C.ink} strokeWidth={5} strokeDasharray="12 11" strokeLinecap="round" />
      <path d={`M${xe - 17} ${y - 14} L${xe - 2} ${y} L${xe - 17} ${y + 14}`} stroke={C.ink} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={clamp(p * 3)} />
      <circle cx={x1} cy={y} r={8 * clamp(p * 4)} fill={C.bg} stroke={C.ink} strokeWidth={4.5} />
    </svg>
  );
};

// kąt batuty w czasie: klatki kluczowe [czas dojścia, kąt] — ruch 0.16 s z lekkim „przestrzeleniem" (gest dyrygenta)
function batonAngle(t) {
  const KF = [[0, 22], [1.42, 6], [CHIPS + 0.05, aimAt(HAND_UP, 280, rowC(0))]];
  for (let i = 1; i < 5; i++) KF.push([CHIPS + 0.05 + i * CHIP_STEP, aimAt(HAND_UP, 280, rowC(i))]);
  KF.push([2.4, 8]);
  for (let i = 0; i < 5; i++) KF.push([rowAt(i) + 0.2, aimAt(HAND_REACH, D.tileX + D.tile / 2, rowC(i))]);
  KF.push([FLOURISH + 0.05, -12], [FLOURISH + 0.3, 14], [BAR_AT + 0.1, 30]);
  let a = KF[0][1];
  for (let k = 1; k < KF.length; k++) {
    const [tk, ak] = KF[k], dur = Math.min(0.16, tk - KF[k - 1][0]);
    if (t >= tk - dur) { const p = prog(t, tk - dur, dur); a = lerp(KF[k - 1][1], ak, p >= 1 ? 1 : backOut(p, 1.6)); }
  }
  return a;
}

function clawdState(t) {
  // faza dyrygenta (na podeście)
  if (t < JUMP) {
    const d = prog(t, 0.3, 0.3);
    let lift = d < 1 ? (1 - d * d) * 14 : 0;
    let squash = 0.22 * pulse(t, 0.6, 0.18) - (d < 1 ? 0.06 : 0);
    const beats = [CHIPS, ...ROWS.map((_, i) => rowAt(i))];
    beats.forEach((b, j) => { squash += 0.09 * pulse(t, b + (j ? 0.12 : 0), 0.16); });
    lift += 1.6 * pulse(t, FLOURISH, 0.3);
    squash += 0.14 * pulse(t, FLOURISH + 0.28, 0.14);
    lift += 0.9 * pulse(t, BAR_AT + 0.12, 0.24);                           // pewne kiwnięcie przy „nie gubi się"
    if (t > COLLAPSE - 0.02) squash += 0.22 * cubicOut(prog(t, COLLAPSE - 0.02, JUMP - COLLAPSE + 0.02));   // przysiad przed skokiem
    const arms = t < 1.42 ? 'down' : t > FLOURISH - 0.02 && t < FLOURISH + 0.34 ? 'up' : t > rowAt(0) - 0.08 && t < FLOURISH ? 'reach' : 'rightUp';
    const rot = batonAngle(t) + (t > BAR_AT + 0.3 ? Math.sin((t - BAR_AT) * 9) * 7 : 0);
    const look = t < 1.2 ? 0 : t > FLOURISH - 0.02 && t < FLOURISH + 0.34 ? 0 : 1;
    const tucked = t > COLLAPSE;                                             // chowa batutę i szykuje się do skoku
    return { x: CX, y: CF, u: CU, lift, squash, arms: tucked ? 'down' : arms, look: tucked ? 1 : look, flip: true, opacity: clamp(d * 5),
      hold: tucked ? null : { ...BATON, rot } };
  }
  // skok na środek kadru (rośnie)
  if (t < JUMP + JUMP_DUR) {
    const k = prog(t, JUMP, JUMP_DUR), e = cubicInOut(k);
    return { x: lerp(CX, FIN.x, cubicOut(k)), y: lerp(CF, FIN.f, k * k) - Math.sin(Math.PI * k) * 18, u: lerp(CU, FIN.u, k * k), lift: 0, squash: -0.1, arms: 'up', look: 0, flip: false, opacity: 1, hold: null };
  }
  // kadr końcowy: lądowanie, potem macha naprzemiennie rękami
  const land = JUMP + JUMP_DUR;
  const waving = t > WAVE;
  const arms = waving ? (Math.floor((t - WAVE) * 4) % 2 ? 'rightUp' : 'leftUp') : 'up';
  const lift = 1.6 * pulse(t, land + 0.16, 0.3) + (waving ? Math.abs(Math.sin((t - WAVE) * Math.PI * 2)) * 0.35 : 0);
  return { x: FIN.x, y: FIN.f, u: FIN.u, lift, squash: 0.24 * pulse(t, land, 0.18) + 0.1 * pulse(t, land + 0.44, 0.12), arms, look: 0, flip: false, opacity: 1, hold: null };
}

export default function S13({ t }) {
  const cs = clawdState(t);
  const exitDiag = t > COLLAPSE ? { ...blurOut(t, COLLAPSE, { dur: 0.3 }), transform: `translateX(${(-40 * cubicOut(prog(t, COLLAPSE, 0.4))).toFixed(1)}px)` } : {};
  const podIn = popIn(t, 0.22, { dur: 0.4, from: 0.7, c: 1.6 });
  const podOut = t > JUMP + 0.1 ? blurOut(t, JUMP + 0.1, { dur: 0.3 }) : {};
  const shadowK = 1 - Math.min(1, cs.lift / 8);
  const finW = 5 * ROW.s + 4 * ROW.gap;

  return (
    <>
      <Words t={t} at={0.05} text="U mnie ta sama zasada działa w" size={56} y={276} step={0.12} />
      <Keyword t={t} at={1.0} text="OPENCODE" y={352} max={168} width={800} letterStep={0.06} />

      {/* diagram: chipy-skille + strzałki (znikają w finale) */}
      {t < COLLAPSE + 0.35 && <div style={{ position: 'absolute', inset: 0, ...exitDiag }}>
        {ROWS.map((r, i) => (
          <React.Fragment key={r.name}>
            <SkillChip t={t} at={CHIPS + i * CHIP_STEP} i={i} />
            <DashArrow t={t} at={rowAt(i)} x1={D.ax1} x2={D.ax2} y={rowC(i)} />
          </React.Fragment>
        ))}
      </div>}

      {/* role: kafle (w diagramie obok chipów → w finale jeden rząd) */}
      {ROWS.map((r, i) => {
        const at = rowAt(i) + 0.14;
        const pop = prog(t, at, 0.42);
        const k = cubicInOut(prog(t, COLLAPSE + 0.04 + (4 - i) * 0.04, 0.4));   // od dołu: „mody” odlatuje pierwsze, zanim Clawd skoczy
        const x0 = D.tileX, y0 = rowC(i) - D.tile / 2;
        const x1 = FIN.x - finW / 2 + i * (ROW.s + ROW.gap), y1 = ROW.y;
        const size = lerp(D.tile, ROW.s, k);
        const hop = t > WAVE ? Math.max(0, Math.sin((t - WAVE) * 5 - i * 0.7)) * 12 : 0;      // fala w rzędzie na pożegnanie
        const flourish = pulse(t, FLOURISH + i * 0.05, 0.26);
        const sc = (pop > 0 ? 0.3 + 0.7 * backOut(pop, 2.2) : 0.3) * (1 + 0.1 * flourish);
        return (
          <div key={r.name} style={{ position: 'absolute', left: lerp(x0, x1, k), top: lerp(y0, y1, k) - Math.sin(Math.PI * k) * 40 - hop, width: size, height: size, borderRadius: 24,
            background: '#FAFAFA', boxShadow: '0 18px 34px rgba(0,0,0,.14), 0 4px 10px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: clamp(pop * 4), transform: `scale(${sc.toFixed(3)})`, filter: `blur(${((1 - expoOut(pop)) * 8).toFixed(2)}px)` }}>
            <div style={{ transform: `scale(${lerp(0.86, 1.14, k).toFixed(3)})` }}><Icon name={r.icon} t={t} /></div>
          </div>
        );
      })}

      {/* „takt" — obwódka wokół roli, którą Clawd właśnie wskazuje */}
      {ROWS.map((r, i) => {
        const k = prog(t, rowAt(i) + 0.22, 0.34); if (k <= 0 || k >= 1) return null;
        const g = 8 + 16 * cubicOut(k);
        return <div key={'ring' + i} style={{ position: 'absolute', left: D.tileX - g, top: rowC(i) - D.tile / 2 - g, width: D.tile + 2 * g, height: D.tile + 2 * g, borderRadius: 22 + g,
          border: `4px solid ${C.ink}`, boxSizing: 'border-box', opacity: 1 - k }} />;
      })}

      {/* podest dyrygenta */}
      {t < JUMP + 0.45 && <div style={{ position: 'absolute', left: POD.x, top: POD.top, width: POD.w, height: POD.bottom - POD.top, opacity: podIn.opacity, transform: podIn.transform, transformOrigin: '50% 100%', ...podOut }}>
        <div style={{ position: 'absolute', inset: 0, background: '#2B2B2E', borderRadius: 10, boxShadow: '0 22px 40px rgba(0,0,0,.2)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 18, background: '#45454B', borderRadius: '10px 10px 0 0' }} />
        <svg width={POD.w} height={POD.bottom - POD.top} style={{ position: 'absolute', left: 0, top: 0 }} shapeRendering="crispEdges">
          {[0, 1, 2, 3].map((j) => <rect key={j} x={22 + j * 34} y={58} width={20} height={20} fill={j % 2 ? '#3A3A3F' : '#55555A'} />)}
          <rect x={22} y={104} width={120} height={10} fill="#3A3A3F" />
        </svg>
      </div>}

      {/* belka „AI się nie gubi" */}
      <HighlightBox t={t} at={BAR_AT} text="AI się nie gubi" size={70} y={BAR_Y} />

      {/* cień pod Clawdem w finale */}
      {t > JUMP + JUMP_DUR - 0.06 && <div style={{ position: 'absolute', left: FIN.x - 150 * shadowK, top: FIN.f - 12, width: 300 * shadowK, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,.16)', filter: 'blur(7px)' }} />}

      <Clawd x={cs.x} y={cs.y} u={cs.u} t={t} arms={cs.arms} look={cs.look} flip={cs.flip} lift={cs.lift} squash={cs.squash} hold={cs.hold} opacity={cs.opacity}
        style={{ filter: `blur(${((1 - expoOut(prog(t, 0.3, 0.3))) * 8).toFixed(2)}px)` }} />
    </>
  );
}
