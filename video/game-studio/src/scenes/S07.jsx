// S07 — „a czwarty podpina grę pod dowolny kontroler. Dzięki temu zagrasz na telefonie, tablecie albo laptopie."
// A (0–2.45 s): SKILL 04 / KONTROLER. Gra „śpi" (szary ekran, migająca ikonka pada). Clawd ciągnie kabel od pada,
//   podskakuje i wbija wtyczkę w gniazdo karty → klik, ekran włącza się jak stary kineskop, gra ożywa, po kablu płyną dane.
// B (2.45–6.0 s): pad wpada Clawdowi w ręce; z pada wychodzą przerywane łącza i kolejno wskakują telefon, tablet, laptop
//   (chipy zsynchronizowane z lektorem). Clawd gra: wciska przyciski, urządzenia reagują, na koniec podskakuje z radości.
import React from 'react';
import { Kicker, Keyword, Words, keywordSize } from '../components/Text';
import { Card, Chip, Connector } from '../components/UI';
import { GameScreen } from '../components/GameScreen';
import { Phone, Tablet, Laptop, Gamepad } from '../components/Devices';
import { Clawd } from '../components/Clawd';
import { PixelArt } from '../components/Pixel';
import { TOOLS } from '../components/props';
import { C } from '../lib/theme';
import { prog, clamp, lerp, expoOut, cubicOut, cubicInOut, backOut, pulse, popIn, blurOut } from '../lib/anim';

// ——— część A ———
const FA = 1180, UA = 12;                                   // podłoga i rozmiar Clawda
const CARD = { x: 210, y: 540, w: 600, h: 400 };            // karta gry (dół 940)
const SOCK = { cx: 650, y: 930, w: 92, h: 38 };             // gniazdo pod kartą
const PADA = { x: 195, y: FA - 95 * 0.75, s: 0.75 };        // pad leży na podłodze
const X0 = 410, XE = 547;                                   // Clawd idzie od pada pod gniazdo
const TIN = 1.52, TON = 1.58, TB = 2.4;                    // wtyczka w gnieździe, włączenie ekranu, przejście do B
const PLUG = { ...TOOLS.plug, px: 1.2 };

// ——— część B ———
const FB = 1330, UB = 14, XB = 510;
const PADB = { x: 510, y: 1302, s: 0.62 };
const DEV = [
  { id: 'phone', label: 'telefon', at: 2.88, x: 92, y: 640, s: 0.95, chipY: 1095, cx: 201, start: [440, 1300], end: [201, 1206], bend: -40 },
  { id: 'tablet', label: 'tablet', at: 3.6, x: 294, y: 284, s: 1.08, chipY: 626, cx: 510, start: [510, 1240], end: [510, 734], bend: -30 },
  { id: 'laptop', label: 'laptop', at: 4.3, x: 534, y: 740, s: 0.88, chipY: 1015, cx: 736, start: [580, 1300], end: [736, 1124], bend: 50 },
];
const PRESS_A = [1.96, 2.14, 2.3];
const PRESS_B = [3.08, 3.36, 3.78, 4.06, 4.48, 4.76, 5.3, 5.72, 5.96, 6.18];

// ikonka „podłącz pad" na uśpionym ekranie
const PAD_ICON = [
  '..wwwwwwwwwwww..',
  '.wwwwwwwwwwwwww.',
  'www.wwwwwwww.www',
  'ww...wwwwww.w.ww',
  'www.wwwwwwww.www',
  'wwwwwwwwwwwwwwww',
  'wwwww......wwwww',
  'wwww........wwww',
  '.ww..........ww.',
];

// punkt na Clawdzie (w jednostkach jego siatki) → px ekranu; powtarza transformację z Clawd.jsx
const clawdPt = (x, feet, u, t, { walk = false, lift = 0, squash = 0 }, ux, uy) => {
  const step = Math.floor(t * 5) % 2;
  const by = walk ? (step ? -0.6 : 0) : (Math.floor(t * 2.2) % 2 ? -0.35 : 0);
  const X = 9 + (ux - 9) * (1 + squash), Y = 10 + (uy - 10) * (1 - squash) + by - lift;
  return [x + (X - 9) * u, feet + (Y - 10) * u];
};
const cubic = (p0, p1, p2, p3, k) => { const m = 1 - k; return [0, 1].map((i) => m * m * m * p0[i] + 3 * m * m * k * p1[i] + 3 * m * k * k * p2[i] + k * k * k * p3[i]); };
const quadOf = ({ start: [x1, y1], end: [x2, y2], bend }) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const qx = mx - (dy / L) * bend, qy = my + (dx / L) * bend;
  return (k) => [(1 - k) * (1 - k) * x1 + 2 * (1 - k) * k * qx + k * k * x2, (1 - k) * (1 - k) * y1 + 2 * (1 - k) * k * qy + k * k * y2];
};

// stan Clawda w części A
function stateA(t) {
  const x = lerp(X0, XE, cubicInOut(prog(t, 0.55, 0.65)));
  const walk = t > 0.55 && t < 1.2;
  let lift = 0, squash = 0;
  if (t > 1.2 && t < 1.36) squash += 0.2 * cubicOut(prog(t, 1.2, 0.14));           // przysiad
  if (t >= 1.36 && t < 1.6) lift = 4.7 * cubicOut(prog(t, 1.36, 0.16));             // wyskok z wtyczką
  if (t >= 1.6 && t < 1.82) { const p = prog(t, 1.6, 0.22); lift = 4.7 * (1 - p * p); }
  squash -= 0.14 * pulse(t, 1.36, 0.16);
  squash += 0.22 * pulse(t, 1.82, 0.18);                                              // lądowanie
  lift += 1.8 * pulse(t, 2.04, 0.3);                                                  // radosny podskok
  squash += 0.12 * pulse(t, 2.34, 0.12);
  const arms = t < 1.6 ? 'rightUp' : t < 1.84 ? 'up' : t < 1.98 ? 'down' : 'up';
  const look = t > 0.3 && t < 0.56 ? -1 : t < 1.98 ? 1 : 0;
  return { x, walk, lift, squash, arms, look };
}
const AT_IN = stateA(TIN);
const PLUG_TL = clawdPt(XE, FA, UA, TIN, AT_IN, 17 - 2 * PLUG.px, 0.5 - 4 * PLUG.px);    // lewy górny róg wtyczki w gnieździe
const PLUG_BOT = clawdPt(XE, FA, UA, TIN, AT_IN, 17 + 0.5 * PLUG.px, 0.5 + PLUG.px);     // wyjście kabla z wtyczki

// ekran gry w karcie: uśpiony → włączenie „kineskopowe" → działa
const ScreenA = ({ t }) => {
  const W = CARD.w, H = CARD.h - 58;
  const line = expoOut(prog(t, TON, 0.1)), open = cubicOut(prog(t, TON + 0.08, 0.26));
  const blink = Math.floor(t * 3.2) % 2 ? 0.35 : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#050506' }}>
      {t < TON && <>
        <GameScreen variant="gray" t={0} w={W} h={H} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,10,.5)' }} />
        <PixelArt grid={PAD_ICON} palette={{ w: '#F3F3F3' }} unit={9} style={{ position: 'absolute', left: W / 2 - 72, top: H / 2 - 41, opacity: t < 0.6 ? 1 : blink }} />
      </>}
      {t >= TON && open < 1 && (
        <div style={{ position: 'absolute', left: (W / 2) * (1 - line), width: W * line, top: H / 2 - 4 - (H / 2) * open, height: 8 + H * open, background: '#FFFFFF' }} />
      )}
      {t >= TON + 0.08 && (
        <div style={{ position: 'absolute', inset: 0, clipPath: `inset(${((1 - open) * 50).toFixed(2)}% 0 ${((1 - open) * 50).toFixed(2)}% 0)` }}>
          <GameScreen variant="color" t={t} w={W} h={H} />
          <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', opacity: (1 - open) * 0.75 }} />
        </div>
      )}
    </div>
  );
};

// wciśnięty przycisk pada (ciemniejsze kółko nałożone na przycisk)
const BTN = [[222, 78], [252, 100], [222, 122], [192, 100]];
const PadPress = ({ x, y, s, presses, t }) => presses.map((pt, i) => {
  const k = pulse(t, pt, 0.2);
  if (k <= 0) return null;
  const [bx, by] = BTN[i % 4];
  return <div key={i} style={{ position: 'absolute', left: x - 150 * s + (bx - 13) * s, top: y - 95 * s + (by - 13) * s, width: 26 * s, height: 26 * s, borderRadius: '50%', background: '#6E6E74', opacity: clamp(k * 2), transform: `scale(${1 - 0.18 * k})` }} />;
});

const Packet = ({ x, y }) => <span style={{ position: 'absolute', left: x - 8, top: y - 8, width: 16, height: 16, borderRadius: 3, background: '#3BD16F', boxShadow: `0 0 0 3px ${C.bg}` }} />;

export default function S07({ t }) {
  const KW = keywordSize('MECHANIKA', 170, 820);

  // ——— pad: leży (A) → leci do rąk Clawda (B) ———
  const kP = cubicInOut(prog(t, TB + 0.04, 0.44));
  const kC = prog(t, TB + 0.08, 0.42), kCe = cubicInOut(kC);
  const inB = t >= TB + 0.08;

  // ——— Clawd ———
  let cl;
  if (!inB) {
    const a = stateA(t);
    cl = { ...a, feet: FA, u: UA, hold: t < TIN ? PLUG : null };
  } else if (kC < 1) {
    cl = { x: lerp(XE, XB, kCe), feet: lerp(FA, FB, kCe), u: lerp(UA, UB, kCe), lift: Math.sin(Math.PI * kC) * 3.4, squash: -0.08 * Math.sin(Math.PI * kC), arms: 'up', look: 0 };
  } else {
    const recoil = PRESS_B.reduce((m, p) => m + pulse(t, p, 0.14), 0);
    cl = {
      x: XB, feet: FB, u: UB, arms: t > 5.0 && t < 5.36 ? 'up' : 'down',
      lift: 2.8 * pulse(t, 5.02, 0.34) + 1.5 * pulse(t, 5.5, 0.26),
      squash: 0.22 * pulse(t, TB + 0.5, 0.16) + 0.16 * pulse(t, 5.36, 0.14) + 0.1 * pulse(t, 5.76, 0.12) + recoil * 0.05,
      look: t < 3.6 ? -1 : t < 4.3 ? 0 : t < 5.0 ? 1 : 0,
    };
  }

  let pad;
  if (t < TB + 0.04) pad = { ...PADA, rot: 0 };
  else {
    pad = { x: lerp(PADA.x, PADB.x, kP), y: lerp(PADA.y, PADB.y, kP) - Math.sin(Math.PI * kP) * 190, s: lerp(PADA.s, PADB.s, kP), rot: -360 * kP };
    if (kP >= 1) {
      // w rękach: podąża za podskokiem i trzęsie się przy wciskaniu
      const jig = PRESS_B.reduce((m, p) => m + pulse(t, p, 0.14), 0);
      pad.y = PADB.y - cl.lift * UB + jig * 4; pad.rot = (t > 5.0 && t < 5.36 ? -6 : 0) * pulse(t, 5.02, 0.34);
    }
  }
  const padStyle = { ...popIn(t, 0.3, { from: 0.4 }), transform: `${popIn(t, 0.3, { from: 0.4 }).transform} rotate(${pad.rot.toFixed(2)}deg)` };

  // ——— kabel (A) ———
  const P0 = [pad.x, pad.y - 65 * pad.s + 8];
  const E = t < TIN ? clawdPt(cl.x, FA, UA, t, cl, 17 + 0.5 * PLUG.px, 0.5 + PLUG.px) : PLUG_BOT;
  const C1 = [P0[0] + 30, P0[1] - 120], C2 = [E[0] - 90, FA + 70];
  const cableIn = cubicOut(prog(t, 0.36, 0.3));
  const cablePath = `M${P0[0]},${P0[1]} C${C1[0]},${C1[1]} ${C2[0]},${C2[1]} ${E[0]},${E[1]}`;
  const clickK = prog(t, TIN, 0.3);
  const shakeCard = pulse(t, TIN, 0.16) * 6;

  const fadeA = t > TB ? blurOut(t, TB, { dur: 0.3 }) : {};

  return (
    <>
      {/* ================= A ================= */}
      {t < TB + 0.35 && (
        <div style={{ position: 'absolute', inset: 0, ...fadeA }}>
          <Kicker t={t} at={0.05} text="SKILL 04" y={268} size={44} />
          <Keyword t={t} at={0.12} text="KONTROLER" y={334} max={KW} />

          {/* kabel pad → wtyczka */}
          <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            {cableIn > 0.01 && <path d={cablePath} pathLength={1} fill="none" stroke={C.card} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${cableIn} 2`} />}
          </svg>
          {t > TON + 0.22 && [0, 0.33, 0.66].map((o, k) => {
            const kk = ((t - TON - 0.22) * 1.5 + o) % 1;
            const [px, py] = cubic(P0, C1, C2, E, kk);
            return <Packet key={k} x={px} y={py} />;
          })}

          {/* wtyczka zostaje w gnieździe */}
          {t >= TIN && <PixelArt grid={PLUG.grid} palette={PLUG.palette} unit={PLUG.px * UA} style={{ position: 'absolute', left: PLUG_TL[0], top: PLUG_TL[1] }} />}
        </div>
      )}

      {/* B: łącza i pakiety (pod Clawdem — pionowe łącze wychodzi zza jego głowy) */}
      {t > 2.8 && DEV.map((d) => <Connector key={'c' + d.id} t={t} at={d.at - 0.1} dur={0.3} x1={d.start[0]} y1={d.start[1]} x2={d.end[0]} y2={d.end[1]} bend={d.bend} width={5} dot={false} />)}
      {DEV.map((d) => {
        if (t < d.at + 0.4) return null;
        const q = quadOf(d);
        return [0, 0.5].map((o, k) => { const kk = ((t - d.at - 0.4) * 1.3 + o) % 1; const [px, py] = q(kk); return <Packet key={d.id + k} x={px} y={py} />; });
      })}
      {/* Clawd (w A z wtyczką w ręce, w B trzyma pad) */}
      <Clawd x={cl.x} y={cl.feet} u={cl.u} t={t} arms={cl.arms} walk={!!cl.walk} look={cl.look} lift={cl.lift} squash={cl.squash}
        hold={cl.hold ? { ...cl.hold } : null} opacity={clamp(prog(t, 0.34, 0.12) * 1)} style={{ filter: `blur(${((1 - expoOut(prog(t, 0.34, 0.3))) * 10).toFixed(2)}px)` }} />

      {t < TB + 0.35 && (
        <div style={{ position: 'absolute', inset: 0, ...fadeA }}>
          {/* karta gry + gniazdo */}
          <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-shakeCard}px)` }}>
            <Card t={t} at={0.2} x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} title="moja-gra">
              <ScreenA t={t} />
            </Card>
            <div style={{ position: 'absolute', left: SOCK.cx - SOCK.w / 2, top: SOCK.y, width: SOCK.w, height: SOCK.h, borderRadius: '6px 6px 12px 12px', background: C.card,
              opacity: clamp(prog(t, 0.3, 0.2) * 2), boxShadow: '0 10px 18px rgba(0,0,0,.18)' }}>
              <div style={{ position: 'absolute', left: 16, right: 16, bottom: 9, height: 7, borderRadius: 3, background: t >= TON + 0.1 ? '#3BD16F' : '#3A3A3E' }} />
            </div>
          </div>
          {/* klik */}
          {clickK > 0 && clickK < 1 && (
            <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: clamp((1 - clickK) * 2.2) }}>
              {[150, 172, 8, 30].map((ang, j) => {
                const rd = (ang * Math.PI) / 180, ox = SOCK.cx, oy = SOCK.y + SOCK.h / 2, r0 = 62 + clickK * 26, r1 = r0 + 34 * (1 - clickK * 0.5);
                return <line key={j} x1={ox + Math.cos(rd) * r0} y1={oy + Math.sin(rd) * r0} x2={ox + Math.cos(rd) * r1} y2={oy + Math.sin(rd) * r1} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />;
              })}
            </svg>
          )}
          <Words t={t} at={0.62} text="pod **dowolny** kontroler" size={62} y={1262} />
        </div>
      )}

      {/* ================= B (urządzenia) ================= */}
      {DEV.map((d) => {
        if (t < d.at + 0.08) return null;
        const p = prog(t, d.at + 0.08, 0.45), e = expoOut(p);
        const bump = PRESS_B.filter((pt) => pt > d.at + 0.5).reduce((m, pt) => m + pulse(t, pt + 0.06, 0.2), 0);
        const style = { opacity: clamp(p * 3), filter: `blur(${((1 - e) * 14).toFixed(2)}px)`, transform: `translateY(${((1 - e) * 70).toFixed(1)}px) scale(${((0.55 + 0.45 * backOut(p, 1.6)) * (1 + 0.025 * bump)).toFixed(4)})`, transformOrigin: '50% 100%' };
        const Dev = d.id === 'phone' ? Phone : d.id === 'tablet' ? Tablet : Laptop;
        return <Dev key={d.id} x={d.x} y={d.y} s={d.s} t={t} style={style} />;
      })}
      {DEV.map((d) => <Chip key={'ch' + d.id} t={t} at={d.at + 0.25} x={d.cx} y={d.chipY} text={d.label} size={46} center />)}
      {t > 2.8 && DEV.map((d) => {
        const k = clamp(prog(t, d.at + 0.16, 0.12));
        return k > 0 && <span key={'d' + d.id} style={{ position: 'absolute', left: d.end[0] - 11, top: d.end[1] - 11, width: 22, height: 22, borderRadius: 11, boxSizing: 'border-box', background: C.bg, border: `5px solid ${C.ink}`, transform: `scale(${k})` }} />;
      })}

      {/* pad — zawsze nad Clawdem (w B Clawd trzyma go przed sobą) */}
      <Gamepad x={pad.x} y={pad.y} s={pad.s} style={padStyle} />
      {t < TB + 0.04 && <PadPress x={pad.x} y={pad.y} s={pad.s} presses={PRESS_A} t={t} />}
      {kP >= 1 && <PadPress x={pad.x} y={pad.y} s={pad.s} presses={PRESS_B} t={t} />}
    </>
  );
}
