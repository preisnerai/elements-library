// S12 — „Zainstalujesz go jednym ruchem: wklejasz link w Claude i piszesz install skill."
// Ciemna karta czatu „Claude" jak w referencji. Clawd trzyma nad głową chip „link do skilla" i — jak w platformówce —
// podskakuje i uderza od spodu w kartę: link „wskakuje" do pola wiadomości (wklejanie). Potem przechodzi pod przycisk wyślij,
// pisze się „install skill", przycisk robi się pomarańczowy, a Clawd jednym skokiem wybija go od spodu (wysłanie).
// Przerywany łącznik prowadzi do pikselowego paska instalacji, który ładuje się blokami → „✓ zainstalowane", Clawd się cieszy.
import React from 'react';
import { Words, Keyword } from '../components/Text';
import { Card, Connector } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { PixelArt } from '../components/Pixel';
import { C, measure } from '../lib/theme';
import { prog, clamp, lerp, expoOut, cubicOut, backOut, pulse, popIn, typed } from '../lib/anim';

// ——— oś czasu (czas lokalny sceny, s) ———
const T = {
  card: 0.3, drop: 0.42, hop: 1.0, crouch1: 1.26, jump1: 1.38, paste: 1.52,
  walk: 1.86, walkEnd: 2.5, type: 2.34, ready: 3.02, crouch2: 3.02, jump2: 3.18, hit: 3.34, land: 3.58,
  conn: 3.46, bar: 3.54, done: 4.0, cheer: [4.08, 4.44, 4.8], wave: 4.36,
};
const TEXT = 'install skill';

// ——— układ ———
const CARD = { x: 100, y: 570, w: 820, h: 294 };
const CB = CARD.y + CARD.h;            // dolna krawędź karty (834)
const F = 1180, U = 13;                // stopy Clawda, jednostka
const X0 = 330, X1 = 820;              // Clawd: pod polem wiadomości → pod przyciskiem wyślij
const CHIP_H = 84, CHIP_GAP = 10;      // chip niesiony nad głową
const L1 = (F - 10 * U - CHIP_GAP - CHIP_H - CB) / U;   // skok 1: czubek chipa dotyka karty
const L2 = (F - 10 * U - CB) / U;                        // skok 2: ręce dotykają karty
const BTN = { s: 64, r: 26, b: 24 };   // przycisk wyślij (w karcie)
const BAR = { x: 190, y: 1288, w: 640, h: 104, n: 10 };

// ——— pixel-art ———
const LINK = { grid: ['.####...####.', '#...........#', '#..#######..#', '#...........#', '.####...####.'], palette: { '#': '#FFFFFF' } };
const CHECK = { grid: ['.......##', '......##.', '##...##..', '.##.##...', '..###....', '...#.....'], palette: { '#': '#FFFFFF' } };
const PLUS = { grid: ['.#.', '###', '.#.'], palette: { '#': C.ink } };
const BIG = { grid: ['...#...', '...#...', '..###..', '#######', '..###..', '...#...', '...#...'], palette: { '#': C.ink } };

// chip „link do skilla" (ten sam wygląd nad głową Clawda i w polu wiadomości)
const LinkChip = ({ style = {} }) => (
  <div style={{ position: 'absolute', height: CHIP_H, display: 'inline-flex', alignItems: 'center', gap: 14, padding: '0 30px 0 20px', borderRadius: 24,
    background: '#2E2E33', border: '2px solid rgba(255,255,255,.16)', boxSizing: 'border-box', color: '#fff', fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap', ...style }}>
    <span style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PixelArt grid={LINK.grid} palette={LINK.palette} unit={4.4} style={{ transform: 'rotate(-40deg)' }} />
    </span>
    link do skilla
  </div>
);

// „bonk" — piksele rozpryskujące się przy uderzeniu w kartę od spodu
const Bonk = ({ t, at, x, y }) => {
  const dt = t - at; if (dt < 0 || dt > 0.32) return null;
  const k = dt / 0.32;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} shapeRendering="crispEdges">
      {[[-1, 0.25], [-1, 0.75], [1, 0.25], [1, 0.75], [-0.4, 1], [0.4, 1]].map(([sx, sy], i) => {
        const d = 40 + 150 * cubicOut(k), s = 14 * (1 - k * 0.6);
        const px = x + sx * d, py = y + sy * d * 0.55 + 240 * dt * dt * 4;
        return <rect key={i} x={px - s / 2} y={py - s / 2} width={s} height={s} fill={i % 3 === 0 ? '#F6C343' : C.ink} opacity={1 - k * 0.7} />;
      })}
    </svg>
  );
};

// stan Clawda w czasie
function clawdState(t) {
  let x = X0, lift = 0, squash = 0, arms = 'up', look = 0, walk = false;
  const d = prog(t, T.drop, 0.3);
  const opacity = clamp(d * 5);
  if (d < 1) lift += (1 - d * d) * 16;                                   // spada z góry z chipem nad głową
  squash += 0.22 * pulse(t, T.drop + 0.3, 0.2);
  lift += 1.4 * pulse(t, T.hop, 0.24);                                    // „gotowy?" — mały podskok
  squash += 0.1 * pulse(t, T.hop + 0.22, 0.12);
  // skok 1 (wklejenie)
  if (t > T.crouch1 && t < T.jump1) squash += 0.2 * cubicOut(prog(t, T.crouch1, T.jump1 - T.crouch1));
  if (t >= T.jump1 && t < T.paste) lift += L1 * cubicOut(prog(t, T.jump1, T.paste - T.jump1));
  else if (t >= T.paste && t < T.paste + 0.2) { const p = prog(t, T.paste, 0.2); lift += L1 * (1 - p * p); }
  squash -= 0.1 * pulse(t, T.jump1, T.paste - T.jump1);
  squash += 0.2 * pulse(t, T.paste + 0.2, 0.16);
  if (t > T.paste - 0.02) arms = 'down';
  // przejście pod przycisk
  if (t > T.walk) {
    const w = prog(t, T.walk, T.walkEnd - T.walk);
    x = lerp(X0, X1, w < 1 ? w * w * (3 - 2 * w) : 1);
    walk = w > 0 && w < 1; look = 1;
  }
  if (t > T.walkEnd) look = -1;                                           // patrzy, jak pisze się tekst
  // skok 2 (wysłanie) — ręce w górę, uderzenie od spodu
  if (t > T.crouch2 && t < T.jump2) squash += 0.24 * cubicOut(prog(t, T.crouch2, T.jump2 - T.crouch2));
  if (t >= T.jump2 && t < T.hit) lift += L2 * cubicOut(prog(t, T.jump2, T.hit - T.jump2));
  else if (t >= T.hit && t < T.land) { const p = prog(t, T.hit, T.land - T.hit); lift += L2 * (1 - p * p); }
  squash -= 0.14 * pulse(t, T.jump2, T.hit - T.jump2);
  squash += 0.24 * pulse(t, T.land, 0.18);
  if (t > T.jump2 - 0.04 && t < T.land) { arms = 'up'; look = 0; }
  if (t >= T.land) look = -1;                                             // patrzy na pasek instalacji
  // radość: dwa podskoki z rękami w górze, potem macha
  T.cheer.forEach((c, i) => { lift += (i ? 1.4 : 2.6) * pulse(t, c, 0.3); squash += 0.12 * pulse(t, c + 0.28, 0.12); });
  if (t > T.cheer[0] - 0.04) { arms = 'up'; look = 0; }
  if (t > T.wave) arms = Math.floor((t - T.wave) * 7) % 2 ? 'rightUp' : 'leftUp';
  return { x, lift, squash, arms, look, walk, opacity };
}

export default function S12({ t }) {
  const cs = clawdState(t);
  const bump = -12 * pulse(t, T.paste, 0.2) - 14 * pulse(t, T.hit, 0.22);   // karta podskakuje przy uderzeniu
  const by = cs.walk ? (Math.floor(t * 5) % 2 ? -0.6 : 0) : (Math.floor(t * 2.2) % 2 ? -0.35 : 0);
  const topY = F + (-10 * (1 - cs.squash) + by - cs.lift) * U;               // czubek Clawda (z bobem/zgnieceniem)

  // chip: nad głową → w polu wiadomości
  const chipW = measure('link do skilla', 700, 44) + 20 + 56 + 14 + 30 + 4;
  const carried = t < T.paste;
  const slotIn = popIn(t, T.paste, { dur: 0.42, from: 0.5, c: 2.4 });
  const flash = prog(t, T.paste, 0.4);

  // tekst i przycisk
  const txt = typed(TEXT, t, T.type, 19);
  const typing = t > T.type && txt.length < TEXT.length;
  const caretOn = typing || Math.floor(t * 3.2) % 2 === 0;
  const ready = t > T.ready;
  const press = pulse(t, T.hit, 0.2);
  const ring = prog(t, T.hit, 0.5);
  const sent = t > T.hit;

  // pasek instalacji
  const blocks = clamp((t - T.bar) / (T.done - T.bar)) * BAR.n;
  const labelK = prog(t, T.done + 0.02, 0.34);
  const shadowK = 1 - Math.min(1, cs.lift / 12);

  return (
    <>
      <Words t={t} at={0.05} text="Zainstalujesz go" size={60} y={276} />
      <Keyword t={t} at={0.42} text="JEDNYM RUCHEM" y={360} max={150} width={820} letterStep={0.035} />

      {/* Clawd (za kartą — przy uderzeniu od spodu chowa się pod jej krawędź) */}
      {/* cień pod Clawdem */}
      <div style={{ position: 'absolute', left: cs.x - 100 * shadowK, top: F - 10, width: 200 * shadowK, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.16)', filter: 'blur(6px)', opacity: cs.opacity * (0.4 + 0.6 * shadowK) }} />

      {/* chip niesiony nad głową */}
      {carried && <LinkChip style={{ left: cs.x - chipW / 2, top: topY - CHIP_GAP - CHIP_H, opacity: cs.opacity, boxShadow: '0 16px 30px rgba(0,0,0,.22)', background: C.card }} />}

      <Clawd x={cs.x} y={F} u={U} t={t} arms={cs.arms} look={cs.look} walk={cs.walk} lift={cs.lift} squash={cs.squash} opacity={cs.opacity}
        style={{ filter: `blur(${((1 - expoOut(prog(t, T.drop, 0.3))) * 8).toFixed(2)}px)` }} />

      {/* karta czatu */}
      <Card t={t} at={T.card} x={CARD.x} y={CARD.y + bump} w={CARD.w} h={CARD.h} title="Claude">
        {/* wiersz 1: wklejony link (albo kursor, zanim link wpadnie) */}
        {!carried && <div style={{ position: 'absolute', left: 30, top: 24, transformOrigin: '30% 50%', ...slotIn }}><LinkChip style={{ position: 'relative' }} /></div>}
        {!carried && flash < 1 && <div style={{ position: 'absolute', left: 30 - 14 * flash - 6, top: 24 - 14 * flash - 6, width: chipW + 28 * flash + 12, height: CHIP_H + 28 * flash + 12,
          borderRadius: 30, border: '4px solid #FFFFFF', boxSizing: 'border-box', opacity: 1 - flash }} />}
        {carried && t > T.card + 0.3 && <span style={{ position: 'absolute', left: 32, top: 36, width: 4, height: 60, background: C.cardText, opacity: caretOn ? 1 : 0 }} />}
        {/* wiersz 2: „install skill" + przycisk wyślij */}
        <div style={{ position: 'absolute', left: 30, top: 150, fontSize: 52, lineHeight: '60px', letterSpacing: '-0.015em', color: C.cardText, whiteSpace: 'nowrap', opacity: sent ? 1 - 0.35 * prog(t, T.hit, 0.3) : 1 }}>
          {txt}{!carried && !sent && <span style={{ display: 'inline-block', width: 4, height: 56, marginLeft: 4, verticalAlign: '-8px', background: C.cardText, opacity: caretOn ? 1 : 0 }} />}
        </div>
        <div style={{ position: 'absolute', right: BTN.r, bottom: BTN.b, width: BTN.s, height: BTN.s, borderRadius: 18, background: ready ? C.accent : '#3A3A3F',
          transform: `scale(${(1 - 0.2 * press + 0.12 * pulse(t, T.ready, 0.2)).toFixed(3)}) translateY(${(-8 * press).toFixed(1)}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={30} height={30} viewBox="0 0 30 30"><path d="M15 25V6M6 14L15 5L24 14" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        {ring > 0 && ring < 1 && <div style={{ position: 'absolute', right: BTN.r - 40 * ring, bottom: BTN.b - 40 * ring, width: BTN.s + 80 * ring, height: BTN.s + 80 * ring,
          borderRadius: 18 + 20 * ring, border: `4px solid ${C.accent}`, boxSizing: 'border-box', opacity: 1 - ring }} />}
      </Card>

      {/* uderzenia od spodu */}
      <Bonk t={t} at={T.paste} x={X0} y={CB + bump} />
      <Bonk t={t} at={T.hit} x={X1 + 7 * U} y={CB + bump} />

      {/* łącznik: karta → instalacja */}
      {t > T.conn && <Connector t={t} at={T.conn} dur={0.3} x1={250} y1={CB + 14} x2={300} y2={BAR.y - 16} bend={-50} />}

      {/* pikselowy pasek instalacji */}
      <div style={{ position: 'absolute', left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h, ...popIn(t, T.bar - 0.06, { dur: 0.4, from: 0.6, c: 1.8 }), transformOrigin: '50% 50%' }}>
        <div style={{ position: 'absolute', inset: 0, border: `6px solid ${C.ink}`, borderRadius: 14, background: 'rgba(255,255,255,.55)', boxShadow: '0 18px 36px rgba(0,0,0,.14)' }} />
        {Array.from({ length: BAR.n }).map((_, i) => {
          const k = clamp(blocks - i);
          const bw = (BAR.w - 24 - (BAR.n - 1) * 6) / BAR.n;
          return <div key={i} style={{ position: 'absolute', left: 12 + i * (bw + 6), top: 12, width: bw, height: BAR.h - 24, borderRadius: 4, background: C.ink,
            opacity: k > 0 ? 1 : 0, transform: `scaleY(${k > 0 ? 0.4 + 0.6 * backOut(clamp(k * 1.4), 2) : 0})` }} />;
        })}
        {t > T.done && <div style={{ position: 'absolute', left: 12, top: 12, right: 12, bottom: 12, borderRadius: 4, background: C.ink, opacity: clamp(prog(t, T.done, 0.08)) }} />}
        {labelK > 0 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, color: '#fff', fontSize: 56, fontWeight: 700, letterSpacing: '-0.025em',
          clipPath: `inset(-10% ${(100 - labelK * 100).toFixed(1)}% -10% 0)` }}>
          <PixelArt grid={CHECK.grid} palette={CHECK.palette} unit={6.5} />zainstalowane
        </div>}
      </div>

      {/* iskierki radości */}
      {[[640, 1030, BIG, 8, 4.08], [700, 930, PLUS, 10, 4.18], [900, 950, PLUS, 8, 4.44], [600, 1150, PLUS, 9, 4.52]].map(([x, y, g, unit, at], i) => {
        const s = popIn(t, at, { from: 0.2 });
        const tw = Math.floor(t * 6 + i * 1.7) % 3 ? 1 : 0.35;
        return <PixelArt key={i} grid={g.grid} palette={g.palette} unit={unit} style={{ position: 'absolute', left: x - (g.grid[0].length * unit) / 2, top: y - (g.grid.length * unit) / 2, opacity: s.opacity * tw, transform: s.transform }} />;
      })}

    </>
  );
}
