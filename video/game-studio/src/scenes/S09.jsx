// S09 — „Opisujesz zmianę własnymi słowami, a Claude przebudowuje grę od środka: dodaje mapę ze śniegiem, nową broń, nowe stroje,"
// MODY: (A) ciemna karta promptu — prompt wpisuje się na żywo, „wyślij" zmienia się na pomarańczowy i klika;
// (B) łącznik do karty gry, Clawd wskakuje DO gry, świat gry rozpada się w szkic (od środka) i Clawd go przekuwa młotkiem;
// (C) kamera jedzie w górę, przez grę przechodzi pas śniegu → mapa ze śniegiem; Clawd wyskakuje z gry, dostaje miecz (błysk)
//     i nowy strój (czapki przełączają się jak w kreatorze postaci → czapka + szalik). Chipy podpisują każdą zmianę.
// Czasy beatów liczone z tempa lektora (~17 znaków/s): „mapę ze śniegiem" ≈ 4.7 s, „nową broń" ≈ 5.8 s, „nowe stroje" ≈ 6.4 s.
import React from 'react';
import { Words, Keyword, HighlightBox } from '../components/Text';
import { Card, Chip, Connector } from '../components/UI';
import { GameScreen } from '../components/GameScreen';
import { Clawd } from '../components/Clawd';
import { TOOLS, HATS } from '../components/props';
import { PixelArt, PixelGroup } from '../components/Pixel';
import { C } from '../lib/theme';
import { prog, clamp, lerp, expoOut, cubicOut, cubicInOut, backOut, pulse, blurOut, typed } from '../lib/anim';

// ——— oś czasu (s, czas lokalny sceny) ———
const T = {
  type: 0.42, send: 1.92, swap: 2.0, conn: 2.06, jumpIn: 2.5, land: 2.9, strikes: [3.18, 3.5, 3.82],
  pan: 3.96, panDur: 0.5, snow: 4.36, snowDur: 0.55, chip1: 4.52,
  out: 4.98, outDur: 0.4, sword: 5.42, chip2: 5.48, swing: 5.72, fits: [5.96, 6.09, 6.22], chip3: 6.04, scarf: 6.3, pose: 6.42,
};
const PROMPT = 'dodaj mapę ze śniegiem, nową broń i stroje';

// ——— karta gry ———
const G = { x: 150, w: 720, h: 420, yA: 800, yC: 400 };
const GH = G.h - 58;                       // wysokość ekranu gry (362)
const GU = 18, GOFF = -35;                 // jednostka siatki gry (40×24, slice) → px; przesunięcie kadrowania
const groundOf = (cy) => cy + 58 + 18 * GU + GOFF;   // y trawy (stóp) w grze
const IN_X = 582, IN_U = 7;                          // x Clawda w środku gry
const OUT = { x: 810, y: 1305, u: 10 };    // faza A — Clawd przed kartą gry
const FIN = { x: 782, y: 1266, u: 15 };    // faza C — Clawd na zaspie

// ——— lokalne siatki pixel-art ———
const SNOWFLAKE = { grid: ['...w...', '.w.w.w.', '..www..', 'wwwwwww', '..www..', '.w.w.w.', '...w...'], palette: { w: '#CFE6FF' } };
const SHIRT = { grid: ['bbb..bbb', 'bbbwwbbb', 'bbbbbbbb', '.bbbbbb.', '.bbbbbb.', '.bbbbbb.'], palette: { b: '#3E7BFA', w: '#F2F2F2' } };
const DRIFT = {
  grid: ['.......wwwwwwww.......', '....wwwwwwwwwwwwwww...', '..wwwwwwwwwwwwwwwwwww.', 'wwwwwwwwwwwwwwwwwwwwww', 'ssssssssssssssssssssss'],
  palette: { w: '#FFFFFF', s: '#D3E2EE' },
};
const FLAKE = { grid: ['.w.', 'www', '.w.'], palette: { w: '#FFFFFF' } };
// miecz pionowy z obrysem (czytelny na jasnym tle); ax/ay = środek rękojeści
const SWORD = { grid: ['..kk..', '.kwwk.', '.kwlk.', '.kwlk.', '.kwlk.', '.kwlk.', '.kwlk.', 'kggggk', '.khhk.', '.khhk.', '..gg..'],
  palette: { k: '#1B1B1D', w: '#F7F9FB', l: '#A9BCCE', g: '#F2C14E', h: '#7A4A2A' }, px: 0.9, ax: 3, ay: 9 };
// czapka zimowa: niebieska z ciemnym otokiem i żółtym pomponem (biały otok znikał na jasnym tle)
const BEANIE = { grid: ['.....pp.....', '....bbbb....', '..bbbbbbbb..', '.bbbbbbbbbb.', 'dddddddddddd'], palette: { p: '#F6C343', b: '#3E7BFA', d: '#24489E' }, px: 1, dx: 3, dy: -5 };
const HAT_CYCLE = [HATS.cap, HATS.crown, BEANIE];

// nakładka w układzie jednostek Clawda (te same transformacje co w Clawd.jsx) — do szalika
const ClawdLayer = ({ x, y, u, t, lift = 0, squash = 0, flip = false, children }) => {
  const by = Math.floor(t * 2.2) % 2 ? -0.35 : 0;
  return (
    <svg width={38 * u} height={26 * u} viewBox="-10 -14 38 26" shapeRendering="crispEdges"
      style={{ position: 'absolute', left: x - 19 * u, top: y - 24 * u, overflow: 'visible', transform: `${flip ? 'scaleX(-1)' : ''} rotate(0deg)`, transformOrigin: `${19 * u}px ${24 * u}px` }}>
      <g transform={`translate(0 ${by - lift}) translate(9 10) scale(${1 + squash} ${1 - squash}) translate(-9 -10)`}>{children}</g>
    </svg>
  );
};
// szalik: pas w paski pod oczami + zwisający koniec z frędzlami (jednostki Clawda)
const Scarf = ({ k }) => {
  const w = 12.4 * clamp(k / 0.6);
  const tail = clamp((k - 0.6) / 0.4);
  return (
    <g>
      <rect x={2.8} y={4.4} width={w} height={1.5} fill="#3E7BFA" />
      <rect x={2.8} y={5.9} width={w} height={0.45} fill="#24489E" />
      {tail > 0 && <g>
        <rect x={10.4} y={6.3} width={2.4} height={3.3 * tail} fill="#3E7BFA" />
        <rect x={10.4} y={7.0} width={2.4} height={0.6 * tail} fill="#F6C343" />
        <rect x={10.4} y={8.2} width={2.4} height={0.6 * tail} fill="#F6C343" />
        {tail >= 1 && [10.4, 11.35, 12.3].map((fx) => <rect key={fx} x={fx} y={9.6} width={0.5} height={0.6} fill="#24489E" />)}
      </g>}
    </g>
  );
};

// iskry przy uderzeniu młotkiem (deterministyczne)
const Sparks = ({ t, at, x, y }) => {
  const dt = t - at; if (dt < 0 || dt > 0.3) return null;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} shapeRendering="crispEdges">
      {Array.from({ length: 9 }).map((_, i) => {
        const a = -Math.PI / 2 + (i - 4) * 0.36, v = 420 + (i % 3) * 140;
        const px = x + Math.cos(a) * v * dt, py = y + Math.sin(a) * v * dt + 0.5 * 2200 * dt * dt, s = (i % 2 ? 9 : 12) * (1 - dt / 0.34);
        return <rect key={i} x={px - s / 2} y={py - s / 2} width={s} height={s} fill={i % 3 === 0 ? '#F6C343' : '#FFFFFF'} stroke="#1B1B1D" strokeWidth={1.5} />;
      })}
    </svg>
  );
};

// tor wyskoku z gry na zaspę (środek Clawda) — ta sama krzywa rysowana jako przerywany łącznik
const JUMP_BEND = -240;
const jumpPath = () => {
  const x1 = IN_X, y1 = groundOf(G.yC) - 5 * IN_U, x2 = FIN.x, y2 = FIN.y - 5 * FIN.u;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  return { x1, y1, x2, y2, cx: mx - (dy / L) * JUMP_BEND, cy: my + (dx / L) * JUMP_BEND };
};
const onJump = (k) => { const P = jumpPath(), a = (1 - k) * (1 - k), b = 2 * k * (1 - k), c = k * k; return [a * P.x1 + b * P.cx + c * P.x2, a * P.y1 + b * P.cy + c * P.y2]; };

// stan Clawda w czasie (pozycja na ekranie, rozmiar, poza, rekwizyty)
function clawdState(t, cardY) {
  const g = groundOf(cardY);
  const hammerOut = { ...TOOLS.hammer, px: 1.25, rot: -15 };
  if (t < T.jumpIn) {                                   // A: spada przed kartę gry, patrzy na prompt, reaguje na „wyślij"
    const d = prog(t, 0.9, 0.4);
    const lift = d < 1 ? (1 - backOut(d, 1.3)) * 22 : 0;
    const hop = pulse(t, T.send, 0.34) * 2.4;
    const crouch = pulse(t, T.jumpIn - 0.16, 0.16);
    return { x: OUT.x, y: OUT.y, u: OUT.u, lift: lift + hop, opacity: clamp(d * 5),
      squash: pulse(t, 1.3, 0.22) * 0.2 - (d < 1 ? 0.08 : 0) - hop * 0.03 + crouch * 0.2,
      arms: t > T.send - 0.02 && t < T.send + 0.36 ? 'up' : 'down', look: t > 1.3 && t < T.send ? -1 : 0, hold: hammerOut };
  }
  if (t < T.land) {                                     // skok DO gry: łuk w górę, maleje do skali świata gry
    const k = prog(t, T.jumpIn, T.land - T.jumpIn);
    return { x: lerp(OUT.x, IN_X, k), y: lerp(OUT.y, g, k) - Math.sin(Math.PI * k) * 190, u: lerp(OUT.u, IN_U, cubicOut(k)), lift: 0,
      squash: -0.12, arms: 'up', look: -1, hold: hammerOut };
  }
  if (t < T.out) {                                      // w środku gry: kucie młotkiem, potem radość ze śniegu
    let rot = -10;
    T.strikes.forEach((s) => {
      if (t > s - 0.26 && t <= s - 0.08) rot = lerp(-10, -95, cubicOut(prog(t, s - 0.26, 0.18)));
      else if (t > s - 0.08 && t <= s) rot = lerp(-95, 135, prog(t, s - 0.08, 0.08));
      else if (t > s && t <= s + 0.12) rot = lerp(135, -10, cubicOut(prog(t, s, 0.12)));
    });
    const hit = T.strikes.reduce((m, s) => Math.max(m, pulse(t, s, 0.12)), 0);
    const cheer = t > T.snow + 0.35;
    return { x: IN_X, y: g, u: IN_U, lift: cheer ? pulse(t, T.snow + 0.35, 0.3) * 2 : 0, squash: pulse(t, T.land, 0.2) * 0.25 + hit * 0.12,
      arms: cheer ? 'up' : 'down', look: cheer ? 0 : 1, hold: { ...TOOLS.hammer, px: 1.5, rot } };
  }
  const gC = groundOf(G.yC);
  if (t < T.out + T.outDur) {                           // wyskok z gry do przodu (rośnie)
    const k = prog(t, T.out, T.outDur), u = lerp(IN_U, FIN.u, k * k), [px, py] = onJump(k);
    return { x: px, y: py + 5 * u, u, lift: 0,
      squash: -0.1, arms: 'up', look: 1, flip: k > 0.5, hold: null };
  }
  // C: na zaspie — miecz z błyskiem, wymach, przebieranie, poza
  const sp = prog(t, T.sword, 0.32);
  // wymach: ostrze odchyla się do tyłu i tnie w stronę chipów (w lokalnym układzie odbitego Clawda + = na zewnątrz)
  const swing = t > T.swing && t < T.swing + 0.36 ? Math.sin(prog(t, T.swing, 0.36) * Math.PI * 2) * -45 : 0;
  const fit = T.fits.reduce((i, at, j) => (t >= at ? j : i), -1);
  const fitPop = T.fits.reduce((m, at) => Math.max(m, pulse(t, at, 0.14)), 0);
  const pose = t > T.pose;
  const bounce = pose ? Math.abs(Math.sin((t - T.pose) * 6.2)) * 1.1 : 0;
  return { x: FIN.x, y: FIN.y, u: FIN.u, flip: true, lift: bounce + fitPop * 0.8,
    squash: pulse(t, T.out + T.outDur, 0.24) * 0.24 + fitPop * 0.1,
    arms: t < T.sword - 0.04 ? 'down' : pose ? 'up' : 'rightUp', look: pose ? (Math.floor((t - T.pose) * 2.4) % 2 ? 0 : 1) : 1,
    hold: t >= T.sword - 0.04 ? { ...SWORD, px: SWORD.px * (0.4 + 0.6 * (sp > 0 ? backOut(sp, 2.4) : 0)), rot: (pose ? 12 : 24) + swing } : null,
    hat: fit >= 0 ? HAT_CYCLE[fit] : null, scarf: prog(t, T.scarf, 0.22) };
}

export default function S09({ t }) {
  // kamera: karta gry jedzie w górę, kiedy prompt odchodzi
  const pan = cubicInOut(prog(t, T.pan, T.panDur));
  const cardY = lerp(G.yA, G.yC, pan);
  const shake = T.strikes.reduce((m, s) => m + pulse(t, s, 0.12), 0) * (Math.floor(t * 60) % 2 ? 5 : -5);
  const cs = clawdState(t, cardY);

  // A/B: karta promptu
  const txt = typed(PROMPT, t, T.type, 31);
  const typing = t > T.type - 0.1 && txt.length < PROMPT.length;
  const caretOn = typing || (t < T.send && Math.floor(t * 3) % 2 === 0);
  const sendOn = t > T.send - 0.1;
  const click = pulse(t, T.send, 0.2);
  const exitA = t > T.swap ? blurOut(t, T.swap, { dur: 0.25 }) : {};
  const exitB = t > T.pan - 0.02 ? { ...blurOut(t, T.pan - 0.02, { dur: 0.32 }), transform: `translateY(${-70 * cubicOut(prog(t, T.pan - 0.02, 0.4))}px)` } : {};

  // B: świat gry rozpada się w szkic od miejsca lądowania Clawda (od środka), potem pas śniegu
  const grayK = expoOut(prog(t, T.land, 0.55));
  const grayR = grayK * 900;
  const gcx = IN_X - G.x, gcy = 18 * GU + GOFF - 24;
  const snowP = cubicInOut(prog(t, T.snow, T.snowDur));
  const edgeY = snowP * GH;

  // C: śnieg poza grą
  const flakesK = clamp(prog(t, T.snow + 0.12, 0.5));
  const driftP = prog(t, T.snow + 0.36, 0.4);   // zaspa rośnie, zanim Clawd na nią wyskoczy

  // błysk miecza (w okolicy czubka ostrza; Clawd odbity → ostrze w lewo-górę)
  const swRot = ((cs.hold && cs.hold.rot) || 0) * Math.PI / 180, swLen = 9 * ((cs.hold && cs.hold.px) || SWORD.px);
  const tipX = FIN.x - (8 + Math.sin(swRot) * swLen) * FIN.u, tipY = FIN.y - (9.5 + Math.cos(swRot) * swLen) * FIN.u;
  const flash = prog(t, T.sword + 0.04, 0.42);
  const glint = pulse(t, 6.72, 0.3);

  return (
    <>
      {/* C: płatki śniegu w tle (za kartą) */}
      {flakesK > 0 && Array.from({ length: 14 }).map((_, i) => {
        const x = 90 + ((i * 137.7) % 860), sp = 150 + (i % 4) * 45, y = 240 + (((i * 211.3) % 1200) + (t - T.snow) * sp) % 1220;
        return <div key={i} style={{ position: 'absolute', left: x + Math.sin(t * 2 + i) * 14, top: y, opacity: flakesK * 0.95, filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.28))' }}>
          <PixelArt grid={FLAKE.grid} palette={FLAKE.palette} unit={i % 3 ? 6 : 8} />
        </div>;
      })}

      {/* A: nagłówek „Opisujesz zmianę / własnymi słowami" */}
      {t < T.swap + 0.3 && <div style={{ position: 'absolute', inset: 0, ...exitA }}>
        <Words t={t} at={0.05} text="Opisujesz zmianę" size={58} y={270} />
        <HighlightBox t={t} at={0.78} text="własnymi słowami" size={64} y={350} />
      </div>}

      {/* B: nagłówek „Claude przebudowuje grę / OD ŚRODKA" + karta promptu + łącznik (odchodzą razem przy jeździe kamery) */}
      {t < T.pan + 0.4 && <div style={{ position: 'absolute', inset: 0, ...exitB }}>
        {t > T.swap && <>
          <Words t={t} at={T.swap + 0.08} text="Claude **przebudowuje** grę" size={58} y={270} step={0.11} />
          <Keyword t={t} at={2.9} text="OD ŚRODKA" y={356} max={104} />
        </>}
        <Card t={t} at={0.18} x={100} y={484} w={820} h={236} header={false} radius={30}>
          <div style={{ position: 'absolute', left: 36, top: 26, width: 748, fontSize: 48, lineHeight: 1.22, letterSpacing: '-0.015em', color: C.cardText, whiteSpace: 'normal' }}>
            {txt}<span style={{ display: 'inline-block', width: 4, height: 50, marginLeft: 3, verticalAlign: '-8px', background: C.cardText, opacity: caretOn ? 1 : 0 }} />
          </div>
          <svg width={34} height={34} style={{ position: 'absolute', left: 36, bottom: 30 }}><path d="M17 3V31M3 17H31" stroke="rgba(255,255,255,.45)" strokeWidth={3.5} strokeLinecap="round" /></svg>
          <div style={{ position: 'absolute', right: 24, bottom: 20, width: 62, height: 62, borderRadius: 18, background: sendOn ? C.accent : '#3A3A3F', transform: `scale(${1 - 0.16 * click})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={30} height={30} viewBox="0 0 30 30"><path d="M15 25V6M6 14L15 5L24 14" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          {t > T.send && t < T.send + 0.45 && <div style={{ position: 'absolute', right: 24 + 31 - 31 * (1 + prog(t, T.send, 0.45)), bottom: 20 + 31 - 31 * (1 + prog(t, T.send, 0.45)), width: 62 * (1 + prog(t, T.send, 0.45)), height: 62 * (1 + prog(t, T.send, 0.45)),
            borderRadius: 22, border: `3px solid ${C.accent}`, opacity: 1 - prog(t, T.send, 0.45) }} />}
        </Card>
        {t > T.conn && <Connector t={t} at={T.conn} dur={0.42} x1={350} y1={726} x2={500} y2={794} bend={-36} />}
      </div>}

      {/* karta gry: kolor → szkic (od środka) → śnieg (pas z góry) */}
      <Card t={t} at={0.62} x={G.x + shake} y={cardY} w={G.w} h={G.h} title={t < T.snow + 0.2 ? 'moja-gra' : 'moja-gra · mod'}>
        {grayR < 880 && <GameScreen variant="color" t={t} w={G.w} h={GH} />}
        {grayR > 0 && snowP < 1 && <div style={{ position: 'absolute', inset: 0, clipPath: `circle(${grayR.toFixed(1)}px at ${gcx}px ${gcy}px)` }}>
          <GameScreen variant="gray" t={t} w={G.w} h={GH} />
          <svg width={G.w} height={GH} style={{ position: 'absolute', left: 0, top: 0 }}>
            {Array.from({ length: 21 }).map((_, i) => <line key={'v' + i} x1={i * 36} y1={0} x2={i * 36} y2={GH} stroke="rgba(255,255,255,.13)" strokeWidth={2} />)}
            {Array.from({ length: 11 }).map((_, i) => <line key={'h' + i} x1={0} y1={i * 36 + 1} x2={G.w} y2={i * 36 + 1} stroke="rgba(255,255,255,.13)" strokeWidth={2} />)}
          </svg>
        </div>}
        {grayK > 0 && grayK < 1 && <div style={{ position: 'absolute', left: gcx - grayR, top: gcy - grayR, width: grayR * 2, height: grayR * 2, borderRadius: '50%', border: '6px solid #FFFFFF', opacity: 1 - grayK }} />}
        {snowP > 0 && <div style={{ position: 'absolute', inset: 0, clipPath: snowP < 1 ? `inset(0 0 ${((1 - snowP) * 100).toFixed(2)}% 0)` : undefined }}>
          <GameScreen variant="snow" t={t} w={G.w} h={GH} />
        </div>}
        {snowP > 0 && snowP < 1 && <svg width={G.w} height={40} style={{ position: 'absolute', left: 0, top: edgeY - 14 }} shapeRendering="crispEdges">
          {Array.from({ length: 20 }).map((_, i) => <rect key={i} x={i * 36} y={0} width={36.5} height={14 + ((i * 7) % 4) * 6} fill="#FFFFFF" />)}
        </svg>}
      </Card>

      {/* iskry przy uderzeniach młotkiem w środku gry */}
      {T.strikes.map((s) => <Sparks key={s} t={t} at={s} x={IN_X + 13 * IN_U + 2} y={groundOf(cardY) - 6} />)}

      {/* chipy: lista zmian (lewa kolumna) */}
      {t > T.chip1 && <Chip t={t} at={T.chip1} x={110} y={cardY + G.h - 48} size={48} text="mapa ze śniegiem" icon={<PixelArt grid={SNOWFLAKE.grid} palette={SNOWFLAKE.palette} unit={6} />} />}
      {t > T.chip2 && <Chip t={t} at={T.chip2} x={110} y={906} size={48} text="nowa broń" icon={<PixelArt grid={TOOLS.sword.grid} palette={TOOLS.sword.palette} unit={5.5} />} />}
      {t > T.chip3 && <Chip t={t} at={T.chip3} x={110} y={1036} size={48} text="nowe stroje" icon={<PixelArt grid={SHIRT.grid} palette={SHIRT.palette} unit={6} />} />}

      {/* przerywany tor skoku: z gry na zaspę (zapowiedź wyskoku) */}
      {t > T.snow + 0.38 && t < T.out + T.outDur + 0.3 && <div style={{ position: 'absolute', inset: 0, ...(t > T.out + 0.2 ? blurOut(t, T.out + 0.2, { dur: 0.3 }) : {}) }}>
        <Connector t={t} at={T.snow + 0.38} dur={0.36} x1={IN_X} y1={groundOf(G.yC) - 5 * IN_U} x2={FIN.x} y2={FIN.y - 5 * FIN.u} bend={JUMP_BEND} />
      </div>}

      {/* zaspa pod Clawdem */}
      {driftP > 0 && <div style={{ position: 'absolute', left: FIN.x - 132, top: FIN.y - 6, transform: `scale(${0.3 + 0.7 * backOut(driftP, 1.8)}, ${backOut(driftP, 1.8)})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,.2))' }}>
        <PixelArt grid={DRIFT.grid} palette={DRIFT.palette} unit={12} />
      </div>}

      {/* puch śniegu przy lądowaniu na zaspie */}
      {(() => { const dt = t - (T.out + T.outDur); if (dt < 0 || dt > 0.34) return null; const k = dt / 0.34;
        return <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} shapeRendering="crispEdges">
          {Array.from({ length: 10 }).map((_, i) => { const side = i % 2 ? 1 : -1, v = 160 + (i % 5) * 70, s = 14 * (1 - k * 0.7);
            const px = FIN.x + side * (60 + v * dt), py = FIN.y - 6 - (220 + (i % 3) * 90) * dt + 900 * dt * dt;
            return <rect key={i} x={px - s / 2} y={py - s / 2} width={s} height={s} fill="#FFFFFF" stroke="#C3D3E0" strokeWidth={2} opacity={1 - k * 0.6} />; })}
        </svg>; })()}

      {/* Clawd */}
      <Clawd x={cs.x} y={cs.y} u={cs.u} t={t} lift={cs.lift} squash={cs.squash} arms={cs.arms} look={cs.look} flip={!!cs.flip} hold={cs.hold} hat={cs.hat || null} opacity={cs.opacity ?? 1} />
      {cs.scarf > 0 && <ClawdLayer x={cs.x} y={cs.y} u={cs.u} t={t} lift={cs.lift} squash={cs.squash} flip={!!cs.flip}><Scarf k={cubicOut(cs.scarf)} /></ClawdLayer>}

      {/* „puf" przy każdej zmianie stroju (iskierki przy głowie) */}
      {T.fits.map((at, j) => {
        const k = prog(t, at, 0.26); if (k <= 0 || k >= 1) return null;
        const s = Math.sin(k * Math.PI), hy = FIN.y - 13 * FIN.u - cs.lift * FIN.u;
        return (
          <svg key={j} width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
            {[[-120 - 30 * k, -10], [118 + 30 * k, -34], [10, -80 - 24 * k]].map(([dx, dy], i) => (
              <path key={i} transform={`translate(${FIN.x + dx} ${hy + dy})`} d={`M0 ${-26 * s} L${5 * s} ${-5 * s} L${26 * s} 0 L${5 * s} ${5 * s} L0 ${26 * s} L${-5 * s} ${5 * s} L${-26 * s} 0 L${-5 * s} ${-5 * s} Z`} fill="#FFFFFF" stroke="#1B1B1D" strokeWidth={3} />
            ))}
          </svg>
        );
      })}

      {/* błysk miecza */}
      {(flash > 0 && flash < 1) || glint > 0 ? (() => {
        const k = flash > 0 && flash < 1 ? Math.sin(flash * Math.PI) : glint * 0.7, rays = flash > 0 && flash < 1 ? cubicOut(flash) : 0;
        return (
          <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
            <g transform={`translate(${tipX} ${tipY - cs.lift * FIN.u})`}>
              <path d={`M0 ${-70 * k} L${9 * k} ${-9 * k} L${70 * k} 0 L${9 * k} ${9 * k} L0 ${70 * k} L${-9 * k} ${9 * k} L${-70 * k} 0 L${-9 * k} ${-9 * k} Z`} fill="#FFFFFF" stroke="#1B1B1D" strokeWidth={3} />
              <rect x={-7 * k} y={-7 * k} width={14 * k} height={14 * k} fill="#F6C343" />
              {rays > 0 && Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2 + Math.PI / 8, r1 = 70 + rays * 60, r2 = r1 + 26 * (1 - rays);
                return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke="#1B1B1D" strokeWidth={6} strokeLinecap="round" opacity={1 - rays} />;
              })}
            </g>
          </svg>
        );
      })() : null}
    </>
  );
}
