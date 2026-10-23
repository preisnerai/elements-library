// S04 — „Jeden rozbiera na części mechanikę gry, którą lubisz,"
// SKILL 01 / MECHANIKA: Clawd podskakuje i uderza kluczem w kartę z grą (jak w blok w platformówce),
// karta przechyla się w izometrię i rozpada na warstwy (exploded view), chipy nazywają części.
import React from 'react';
import { Kicker, Keyword, Words, keywordSize } from '../components/Text';
import { Chip, Connector } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { TOOLS } from '../components/props';
import { PixelArt } from '../components/Pixel';
import { C } from '../lib/theme';
import { prog, clamp, lerp, expoOut, cubicOut, cubicInOut, backOut, pulse, blurOut } from '../lib/anim';

// ——— gra rozłożona na warstwy (te same kolory co GameScreen 'color', siatka 40×24) ———
const P = { sky: ['#8ED3FF', '#A8DEFF', '#C3E9FF'], hill: '#4FA35C', grass: '#5BC46A', edge: '#3E9E4F', dirt: '#A86B3C', dot: '#8E5730', brick: '#C9824E',
  coin: '#F6C343', coinHi: '#FFE08A', hero: '#3E7BFA', heroEye: '#FFFFFF', enemy: '#8BD15A', cloud: '#FFFFFF', pole: '#2B2B2E', flag: '#D97757' };
const R = (x, y, w, h, fill, k) => <rect key={k} x={x} y={y} width={w + 0.02} height={h + 0.02} fill={fill} />;
const around = (cx, cy, s) => `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`;

const levelLayer = () => {
  const els = [R(0, 0, 40, 8, P.sky[0], 's0'), R(0, 8, 40, 6, P.sky[1], 's1'), R(0, 14, 40, 4, P.sky[2], 's2')];
  [[4, 3], [24, 2]].forEach(([x, y], i) => els.push(R(x + 1, y, 4, 1, P.cloud, 'c' + i + 'a'), R(x, y + 1, 6, 1, P.cloud, 'c' + i + 'b')));
  [[0, 16, 9, 2], [2, 15, 5, 1], [26, 15, 11, 3], [28, 14, 6, 1]].forEach(([x, y, w, h], i) => els.push(R(x, y, w, h, P.hill, 'h' + i)));
  els.push(R(0, 18, 40, 1, P.grass, 'g'), R(0, 19, 40, 1, P.edge, 'ge'), R(0, 20, 40, 4, P.dirt, 'd'));
  for (let i = 0; i < 12; i++) els.push(R((i * 7 + 3) % 40, 21 + (i % 3), 1, 1, P.dot, 'dd' + i));
  els.push(R(15, 12, 7, 1, P.brick, 'pl'), R(15, 13, 7, 0.3, P.dot, 'pl2'));
  els.push(R(35, 11, 0.5, 7, P.pole, 'po'), R(35.5, 11, 2.5, 1.5, P.flag, 'fl'));
  return els;
};
const enemyLayer = (t, s, e) => {
  const ex = lerp(28, 18.5, e) + Math.sin(t * 3.2) * 2.4 * e;   // wróg wyjęty na środek warstwy, patroluje
  return <g transform={around(ex + 1.5, 11.7, s)}>{[R(ex, 11, 3, 1.5, P.enemy, 'en'), R(ex + 0.6, 11.3, 0.5, 0.5, '#1B1B1D', 'e1'), R(ex + 1.9, 11.3, 0.5, 0.5, '#1B1B1D', 'e2')]}</g>;
};
const coinLayer = (t, s) => (
  <g transform={around(18.5, 10.5, s)}>
    {[16, 18, 20].map((x, i) => { const y = 10 + (Math.floor(t * 4 + i) % 2 ? -0.3 : 0); return [R(x, y, 1, 1, P.coin, 'co' + i), R(x + 0.15, y + 0.15, 0.35, 0.35, P.coinHi, 'ch' + i)]; })}
  </g>
);
const heroLayer = (t, s, e) => {
  const hop = Math.abs(Math.sin(Math.max(0, t - 1.15) * 5.2)) * 3.2 * e;   // skok!
  const hx = lerp(8, 18, e), hy = 15 - hop / s;
  return (
    <g transform={around(hx + 1, 16.5, s)}>
      {e > 0.3 && <path d={`M${hx - 0.8} 18 Q ${hx + 1} 12.6 ${hx + 2.8} 18`} fill="none" stroke="rgba(15,15,16,.45)" strokeWidth={0.18} strokeDasharray="0.45 0.4" opacity={clamp((e - 0.3) * 3)} />}
      {[R(hx, hy, 2, 2, P.hero, 'hb'), R(hx + 1.2, hy + 0.5, 0.6, 0.6, P.heroEye, 'he'), R(hx, hy + 2, 0.7, 1, P.hero, 'l1'), R(hx + 1.3, hy + 2, 0.7, 1, P.hero, 'l2')]}
    </g>
  );
};

const HEART = { grid: ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], palette: { r: '#E3473E' } };
const WRENCH = { grid: ['##.##', '##.##', '#####', '.###.', '..#..', '..#..', '..#..', '..#..', '.###.'], palette: { '#': '#2B2B2E' }, px: 1.05, ax: 2, ay: 8 };

// geometria warstw
const W = 420, H = 252, PAD = 10, GAP = 140;
const A = 56, B = -32;                 // docelowe kąty: rotateX(A) rotateZ(B)
const LAYERS = [                        // od dołu do góry
  { key: 'level', label: 'poziomy' },
  { key: 'enemy', label: 'wrogowie' },
  { key: 'coins', label: 'punkty' },
  { key: 'hero', label: 'skok' },
];

export default function S04({ t }) {
  const KW = keywordSize('MECHANIKA', 170, 820);

  // ——— Clawd: wchodzi, kuca, skacze i uderza kluczem w kartę (0.8 s), ląduje, bierze lupę ———
  const walkIn = cubicOut(prog(t, 0.08, 0.34));
  const cx = lerp(740, 540, walkIn);
  const feet = 1230, u = 11;
  const crouch = pulse(t, 0.4, 0.17);
  const jp = prog(t, 0.55, 0.52);
  const lift = jp > 0 && jp < 1 ? Math.sin(Math.PI * jp) * 4.4 : 0;
  const land = pulse(t, 1.07, 0.2);
  const airborne = jp > 0 && jp < 1;
  const hasLens = t > 1.18;
  const lensPop = backOut(prog(t, 1.18, 0.3), 2.4);
  const hop2 = pulse(t, 2.02, 0.32) * 2.4;     // „lubisz" — radosny podskok
  const arms = airborne ? 'up' : hasLens ? (t > 2.02 && t < 2.34 ? 'leftUp' : 'reach') : 'down';
  const look = t < 0.42 ? -1 : hasLens ? (Math.floor((t - 1.2) * 1.6) % 2 ? 0 : -1) : 0;
  const hold = hasLens ? { ...TOOLS.magnifier, px: 1.15 * lensPop } : { ...WRENCH, rot: airborne ? 4 : 28 };

  // ——— karta → izometria → warstwy ———
  const bump = pulse(t, 0.79, 0.2) * 16;                           // karta podbita od spodu
  const tilt = cubicInOut(prog(t, 0.84, 0.4));
  const ex = backOut(prog(t, 0.96, 0.52), 1.25);                    // rozsunięcie warstw
  const e = clamp(ex);
  const a = (A * tilt * Math.PI) / 180, b = (B * tilt * Math.PI) / 180;
  const sc = lerp(1.3, 1, tilt);
  const ccx = lerp(510, 346, tilt), ccy = lerp(812, 1000, tilt) - bump;
  const hdr = 1 - clamp(tilt * 2.2);
  const zOf = (i) => i * GAP * ex + (i ? Math.sin(t * 2.3 + i * 1.4) * 5 * e : 0);
  const proj = (x, y, z) => {
    const x1 = x * Math.cos(b) - y * Math.sin(b), y1 = x * Math.sin(b) + y * Math.cos(b);
    return [ccx + sc * x1, ccy + sc * (y1 * Math.cos(a) - z * Math.sin(a))];
  };
  const sprite = 1 + 1.25 * e;   // części powiększają się po wyjęciu

  const cardIn = expoOut(prog(t, 0.16, 0.5));
  const chipX = 668;
  const chipsOut = t > 2.05 ? blurOut(t, 2.05, { dur: 0.3 }) : {};   // maks. 3 elementy tekstu naraz

  return (
    <>
      <Kicker t={t} at={0.05} text="SKILL 01" y={268} size={44} />
      <Keyword t={t} at={0.12} text="MECHANIKA" y={334} max={KW} />

      {/* stos warstw (CSS 3D, rzut prostokątny) */}
      <div style={{ position: 'absolute', left: ccx, top: ccy, width: 0, height: 0, transformStyle: 'preserve-3d',
        transform: `translateY(${((1 - cardIn) * 60).toFixed(1)}px) scale(${sc.toFixed(4)}) rotateX(${A * tilt}deg) rotateZ(${B * tilt}deg)`,
        opacity: clamp(cardIn * 3) }}>
        {LAYERS.map((L, i) => {
          const z = zOf(i);
          if (i === 0) return (
            <div key={L.key} style={{ position: 'absolute', left: -W / 2 - PAD, top: -H / 2 - PAD, width: W + PAD * 2, height: H + PAD * 2, borderRadius: 22, background: C.card,
              transform: `translateZ(${z.toFixed(1)}px)`, boxShadow: '0 40px 80px rgba(0,0,0,.26), 0 12px 24px rgba(0,0,0,.16)' }}>
              <div style={{ position: 'absolute', left: 0, top: -50, width: W + PAD * 2, height: 64, borderRadius: '22px 22px 0 0', background: C.card, opacity: hdr,
                display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px 14px', boxSizing: 'border-box' }}>
                {[0, 1, 2].map((k) => <span key={k} style={{ width: 15, height: 15, borderRadius: 8, background: 'rgba(255,255,255,.22)' }} />)}
                <span style={{ marginLeft: 12, fontSize: 27, color: 'rgba(255,255,255,.55)', letterSpacing: '-0.01em' }}>ulubiona-gra</span>
              </div>
              <svg width={W} height={H} viewBox="0 0 40 24" shapeRendering="crispEdges" style={{ position: 'absolute', left: PAD, top: PAD, borderRadius: 12 }}>{levelLayer()}</svg>
            </div>
          );
          return (
            <div key={L.key} style={{ position: 'absolute', left: -W / 2, top: -H / 2, width: W, height: H, borderRadius: 12, boxSizing: 'border-box',
              transform: `translateZ(${z.toFixed(1)}px)`, border: `3.5px dashed rgba(15,15,16,${(0.5 * e).toFixed(3)})`, background: `rgba(250,250,250,${(0.72 * clamp((tilt - 0.55) / 0.45) * clamp((ex - 0.3) / 0.5)).toFixed(3)})` }}>
              <svg width={W} height={H} viewBox="0 0 40 24" shapeRendering="crispEdges" style={{ position: 'absolute', left: -3, top: -3, overflow: 'visible' }}>
                {L.key === 'enemy' ? enemyLayer(t, sprite, e) : L.key === 'coins' ? coinLayer(t, sprite * 1.15) : heroLayer(t, sprite, e)}
              </svg>
            </div>
          );
        })}
      </div>

      {/* uderzenie: kreski „bum" po bokach punktu trafienia */}
      {t > 0.77 && t < 1.08 && (() => { const k = prog(t, 0.77, 0.31), r0 = 46 + k * 30, r1 = r0 + 34 * (1 - k * 0.6); return (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: clamp((1 - k) * 2.2) }}>
          {[200, 160, 20, -20].map((ang, i) => { const rd = (ang * Math.PI) / 180, hx = cx + 90, hy = 992 - bump;
            return <line key={i} x1={hx + Math.cos(rd) * r0} y1={hy + Math.sin(rd) * r0} x2={hx + Math.cos(rd) * r1} y2={hy + Math.sin(rd) * r1} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />; })}
        </svg>); })()}

      {/* chipy z łącznikami do warstw */}
      <div style={{ position: 'absolute', inset: 0, ...chipsOut }}>
      {LAYERS.map((L, i) => {
        const pad = i === 0 ? PAD : 0;
        const [px, py] = proj(W / 2 + pad, H / 2 + pad, zOf(i));
        const at = 1.12 + (LAYERS.length - 1 - i) * 0.13;   // od góry: skok, punkty, wrogowie, poziomy
        return (
          <React.Fragment key={L.key}>
            {e > 0.6 && <Connector t={t} at={at - 0.06} dur={0.25} x1={px + 4} y1={py} x2={chipX - 8} y2={py} bend={0} width={4} />}
            <Chip t={t} at={at} x={chipX} y={py - 38} text={L.label} size={44} style={{ height: 76, padding: '0 30px', borderRadius: 22 }} />
          </React.Fragment>
        );
      })}
      </div>

      {/* serduszko „lubisz" */}
      {t > 2.0 && (() => { const k = prog(t, 2.0, 1.0), s = backOut(prog(t, 2.0, 0.35), 2.6); return (
        <div style={{ position: 'absolute', left: 770, top: 1110 - k * 40, width: 70, height: 60, transform: `scale(${s})`, opacity: clamp((1.25 - k) * 2) }}>
          <PixelArt grid={HEART.grid} palette={HEART.palette} unit={10} />
        </div>); })()}

      <Clawd x={cx} y={feet} u={u} t={t} walk={t < 0.42} arms={arms} look={look} lift={lift + hop2} hold={hold}
        squash={crouch * 0.2 + land * 0.18 - (airborne ? 0.08 : 0)} />

      <Words t={t} at={2.1} text="rozbiera grę, którą **lubisz**" size={60} y={1290} />
    </>
  );
}
