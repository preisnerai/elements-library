// S06 — „trzeci buduje backend,"
// SKILL 03 / BACKEND: serwery spadają jeden po drugim, Clawd wbija każdy młotkiem (uderzenie = diody się zapalają),
// potem wyskakuje baza danych i łączniki z pakietami danych.
import React from 'react';
import { Kicker, Keyword, Words, keywordSize } from '../components/Text';
import { Connector } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { C } from '../lib/theme';
import { prog, clamp, pulse, popIn, blurIn } from '../lib/anim';

const HAMMER = { grid: ['hhhhhh', 'hhhhhh', '..ww..', '..ww..', '..ww..', '..ww..', '..ww..'], palette: { h: '#3A3A3E', w: '#A86B3C' }, px: 1.15, ax: 3, ay: 6.5 };
const LED = ['#5BC46A', '#F6C343', '#2E2E31'];

// wieża: 3 serwery (od dołu)
const TX = 330, TW = 350, SH = 156, FLOOR = 1190, SGAP = 12;
const sTop = (i) => FLOOR - (i + 1) * SH - i * SGAP;
const DROP = [0.14, 0.43, 0.72];            // start spadania
const FALL = 0.23;                           // czas spadania → lądowania: 0.37, 0.66, 0.95
const HITS = DROP.map((d) => d + FALL);
const DB = { x: 760, y: 806, w: 176, h: 268 };

const Server = ({ i, t, x, y, on }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: TW, height: SH, borderRadius: 16, background: C.card,
    boxShadow: '0 22px 40px rgba(0,0,0,.24), 0 6px 12px rgba(0,0,0,.14)', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 3, background: 'rgba(255,255,255,.08)' }} />
    {/* kratka wentylacji */}
    <div style={{ position: 'absolute', left: 30, top: SH / 2 - 35, display: 'grid', gridTemplateColumns: 'repeat(4, 16px)', gap: 11 }}>
      {Array.from({ length: 12 }).map((_, k) => <span key={k} style={{ width: 16, height: 16, borderRadius: 4, background: '#2E2E31' }} />)}
    </div>
    {/* kieszenie dysków */}
    {[0, 1].map((k) => <div key={k} style={{ position: 'absolute', left: 156, top: SH / 2 - 34 + k * 44, width: 104, height: 24, borderRadius: 6, background: 'rgba(255,255,255,.09)' }} />)}
    {/* diody */}
    {[0, 1, 2].map((k) => {
      const c = on ? LED[(Math.floor(t * 9) + i * 2 + k) % 3] : '#2E2E31';   // zawsze świecą 2 z 3
      return <span key={k} style={{ position: 'absolute', left: TW - 56, top: SH / 2 - 44 + k * 32, width: 22, height: 22, borderRadius: 5, background: c }} />;
    })}
  </div>
);

const Database = ({ t, at }) => {
  const { w, h } = DB, ry = 26;
  return (
    <div style={{ position: 'absolute', left: DB.x, top: DB.y, width: w, height: h, ...popIn(t, at, { from: 0.3 }), transformOrigin: '50% 100%' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible', filter: 'drop-shadow(0 22px 26px rgba(0,0,0,.24))' }}>
        <path d={`M0 ${ry} V${h - ry} A${w / 2} ${ry} 0 0 0 ${w} ${h - ry} V${ry} Z`} fill={C.card} />
        {[0.36, 0.66].map((k) => <path key={k} d={`M0 ${h * k} A${w / 2} ${ry} 0 0 0 ${w} ${h * k}`} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth={4} />)}
        <ellipse cx={w / 2} cy={ry} rx={w / 2} ry={ry} fill="#2E2E31" />
        <ellipse cx={w / 2} cy={ry} rx={w / 2 - 3} ry={ry - 3} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={3} />
        {[0, 1, 2].map((k) => <rect key={k} x={w - 46} y={h * (0.22 + k * 0.3) + 8} width={16} height={16} rx={4} fill={Math.floor(t * 7 + k * 2) % 3 ? '#3BD16F' : '#2E2E31'} />)}
      </svg>
    </div>
  );
};

export default function S06({ t }) {
  const KW = keywordSize('MECHANIKA', 170, 820);

  // ——— młotek: zamach przed każdym lądowaniem, uderzenie w momencie lądowania ———
  const near = HITS.reduce((m, h) => (Math.abs(t - h) < Math.abs(t - m) ? h : m), HITS[0]);
  const dt = t - near;
  const windup = dt > -0.2 && dt < 0, strike = dt >= 0 && dt < 0.14;   // uderzenie dokładnie w chwili lądowania
  const cheer = t > 1.38 && t < 1.72;
  const arms = cheer ? 'up' : strike ? 'reach' : 'rightUp';
  const rot = cheer ? 10 : strike ? 84 : windup ? -48 : -14;
  const u = 11, cx = 160, feet = FLOOR;
  const hop = pulse(t, 1.38, 0.34) * 2.6;
  const recoil = HITS.reduce((m, h) => m + pulse(t, h, 0.16), 0);

  // ——— wieża ———
  const shake = HITS.reduce((m, h) => m + (t > h && t < h + 0.14 ? Math.sin((t - h) * 90) * 5 * (1 - (t - h) / 0.14) : 0), 0);
  const servers = [0, 1, 2].map((i) => {
    const p = prog(t, DROP[i], FALL);
    const fallY = -220 * (1 - p * p);                    // przyspieszenie jak grawitacja
    const bounce = -pulse(t, HITS[i], 0.2) * 12;
    return { i, p, y: sTop(i) + (p < 1 ? fallY : bounce), on: t >= HITS[i], visible: t > DROP[i] };
  });

  // ——— łączniki serwer → baza i pakiety danych ———
  const links = [0, 1, 2].map((i) => {
    const x1 = TX + TW + 6, y1 = sTop(i) + SH / 2, x2 = DB.x - 8, y2 = DB.y + DB.h * (0.42 + (1 - i) * 0.16);
    const bend = (i - 1) * 26;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    return { i, x1, y1, x2, y2, bend, qx: mx - (dy / L) * bend, qy: my + (dx / L) * bend, at: 1.06 + (2 - i) * 0.08 };
  });
  const qpt = (l, k) => [(1 - k) * (1 - k) * l.x1 + 2 * (1 - k) * k * l.qx + k * k * l.x2, (1 - k) * (1 - k) * l.y1 + 2 * (1 - k) * k * l.qy + k * k * l.y2];

  return (
    <>
      <Kicker t={t} at={0.05} text="SKILL 03" y={268} size={44} />
      <Keyword t={t} at={0.1} text="BACKEND" y={334} max={KW} />

      {/* plan budowy: przerywane miejsca na serwery i bazę (wypełniane w trakcie) */}
      {[0, 1, 2].map((i) => t < HITS[i] + 0.05 && (
        <div key={'g' + i} style={{ position: 'absolute', left: TX, top: sTop(i), width: TW, height: SH, borderRadius: 16, boxSizing: 'border-box',
          border: '3.5px dashed rgba(15,15,16,.32)', ...blurIn(t, 0.1 + i * 0.06, { dist: 14 }) }} />
      ))}
      {t < 1.1 && (
        <svg width={DB.w + 8} height={DB.h + 8} style={{ position: 'absolute', left: DB.x - 4, top: DB.y - 4, overflow: 'visible', ...blurIn(t, 0.28, { dist: 14 }), opacity: t > 0.98 ? clamp((1.1 - t) * 8) : blurIn(t, 0.28).opacity }}>
          <g transform="translate(4 4)" fill="none" stroke="rgba(15,15,16,.32)" strokeWidth={3.5} strokeDasharray="9 8">
            <path d={`M0 26 V${DB.h - 26} A${DB.w / 2} 26 0 0 0 ${DB.w} ${DB.h - 26} V26`} />
            <ellipse cx={DB.w / 2} cy={26} rx={DB.w / 2} ry={26} />
          </g>
        </svg>
      )}

      {/* cień pod wieżą */}
      <div style={{ position: 'absolute', left: TX - 10, top: FLOOR - 8, width: TW + 20, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,.16)', filter: 'blur(8px)', opacity: clamp(prog(t, 0.3, 0.1)) }} />

      {links.map((l) => <Connector key={l.i} t={t} at={l.at} dur={0.26} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} bend={l.bend} width={4} dot={false} />)}
      {t > 1.32 && links.map((l) => [0].map((o, k) => {
        const kk = ((t - 1.32) * 1.7 + o + l.i * 0.17) % 1;
        const [px, py] = qpt(l, kk);
        return <span key={l.i + '-' + k} style={{ position: 'absolute', left: px - 8, top: py - 8, width: 16, height: 16, borderRadius: 3, background: '#3BD16F', boxShadow: '0 0 0 3px #ECECEC' }} />;
      }))}

      {servers.map((s) => s.visible && (
        <div key={s.i} style={{ position: 'absolute', left: 0, top: 0, opacity: clamp(s.p * 5), transform: `translateX(${shake.toFixed(1)}px)` }}>
          <Server i={s.i} t={t} x={TX} y={s.y} on={s.on} />
        </div>
      ))}

      <Database t={t} at={0.98} />

      {/* „bum" przy uderzeniu młotkiem */}
      {HITS.map((h, k) => {
        if (t < h - 0.01 || t > h + 0.26) return null;
        const q = prog(t, h - 0.01, 0.27), r0 = 26 + q * 26, r1 = r0 + 30 * (1 - q * 0.5), hx = TX - 4, hy = feet - 5 * u;
        return (
          <svg key={k} width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: clamp((1 - q) * 2.2) }}>
            {[-118, -146, 118, 146].map((ang, j) => { const rd = (ang * Math.PI) / 180;
              return <line key={j} x1={hx + Math.cos(rd) * r0} y1={hy + Math.sin(rd) * r0} x2={hx + Math.cos(rd) * r1} y2={hy + Math.sin(rd) * r1} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />; })}
          </svg>
        );
      })}

      <Clawd x={cx} y={feet} u={u} t={t} arms={arms} look={1} lift={hop}
        squash={recoil * 0.12 + pulse(t, 1.72, 0.16) * 0.14} hold={{ ...HAMMER, rot }} />

      <Words t={t} at={0.55} step={0.07} text="buduje serwer i **bazę** **danych**" size={60} y={1290} />
    </>
  );
}
