// S01 — „Claude znajdzie inwestorów dla Twojego biznesu i nawet napisze do nich za Ciebie."
// Clawd z lupą przechodzi pod kartami inwestorów (każda zapala się, gdy ją „znajdzie"),
// potem siada do laptopa i wysyła do nich koperty po przerywanych łącznikach.
import React from 'react';
import { Words, Keyword, HighlightBox } from '../components/Text';
import { Card, Connector } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { PixelArt } from '../components/Pixel';
import { Laptop } from '../components/Devices';
import { TOOLS } from '../components/props';
import { C } from '../lib/theme';
import { prog, backOut, expoOut, cubicInOut, cubicOut, blurIn, blurOut, pulse, clamp, lerp } from '../lib/anim';

const AVATAR = ['...hhhh...', '..hhhhhh..', '..hffffh..', '..ffffff..', '...ffff...', '..sswwss..', '.ssswwsss.', '.sssktsss.', '.ssskksss.'];
const AV_PAL = { h: '#3A3A3E', f: '#E9C9AF', s: '#5A5A60', w: '#F2F2F2', k: '#2B2B2E', t: '#2B2B2E' };
const ENVELOPE = ['kkkkkkkkk', 'kwkkkkkwk', 'kkwkkkwkk', 'kkkwkwkkk', 'kkkkwkkkk', 'kkkkkkkkk'];
const ENV_PAL = { k: '#1B1B1D', w: '#F3F3F3' };
const CHECK = ['.......aa', '......aa.', 'aa...aa..', '.aa.aa...', '..aaa....', '...a.....'];

const CARDS = [{ cx: 230, amount: '200 tys. zł' }, { cx: 510, amount: '1 mln zł' }, { cx: 790, amount: '500 tys. zł' }];
const CW = 248, CY = 590, CH = 290;
const LAP = { x: 440, y: 960, s: 0.66 };          // laptop: 304×193 px
const SRC = { x: 592, y: 966 };                   // punkt wysyłki (górna krawędź ekranu)

// Clawd idzie z lewa na prawo 0.9–2.4 s
const walkX = (t) => lerp(190, 840, cubicInOut(prog(t, 0.9, 1.5)));
// moment, w którym Clawd mija środek karty (liczony deterministycznie z krzywej ruchu)
const passAt = (cx) => { for (let f = 27; f < 90; f++) if (walkX(f / 30) >= cx) return f / 30; return 2.4; };

// punkt na krzywej łącznika (ta sama geometria co Connector)
const bez = (x1, y1, x2, y2, bend, p) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / L) * bend, cy = my + (dx / L) * bend, q = 1 - p;
  return [q * q * x1 + 2 * q * p * cx + p * p * x2, q * q * y1 + 2 * q * p * cy + p * p * y2];
};

export default function S01({ t }) {
  const drop = prog(t, 0.15, 0.4), land = pulse(t, 0.52, 0.25);
  const lift = drop < 1 ? (1 - backOut(drop, 1.2)) * 50 : 0;
  const typing = t > 2.65;
  const x = walkX(t);
  const sendAt = [3.0, 3.35, 3.7];
  return (
    <>
      <div style={t > 2.6 ? blurOut(t, 2.6) : {}}><Words t={t} at={0.05} text="Claude znajdzie Ci" size={60} y={292} /></div>
      <Keyword t={t} at={0.35} text="INWESTORÓW" y={372} max={170} />

      {CARDS.map((c, i) => {
        const found = passAt(c.cx), hit = expoOut(prog(t, found, 0.35)), got = prog(t, sendAt[i] + 0.4, 0.3);
        return (
          <React.Fragment key={i}>
            <Card t={t} at={0.7 + i * 0.12} x={c.cx - CW / 2} y={CY} w={CW} h={CH} header={false} radius={30}
              style={{ outline: `${6 * hit}px solid ${C.accent}`, outlineOffset: 6 * hit }}>
              <PixelArt grid={AVATAR} palette={AV_PAL} unit={11} style={{ position: 'absolute', left: (CW - 110) / 2, top: 34 }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: 168, textAlign: 'center', fontSize: 44, fontWeight: 700, color: C.cardText, letterSpacing: '-0.03em', whiteSpace: 'nowrap', ...blurIn(t, 0.9 + i * 0.12, { dist: 14 }) }}>{c.amount}</div>
            </Card>
            {got > 0 && <PixelArt grid={CHECK} palette={{ a: C.accent }} unit={9} style={{ position: 'absolute', left: c.cx + CW / 2 - 66, top: CY - 74, transform: `scale(${0.4 + 0.6 * backOut(got, 2.4)})`, opacity: clamp(got * 4) }} />}
            <Connector t={t} at={sendAt[i]} dur={0.4} x1={SRC.x} y1={SRC.y} x2={c.cx} y2={CY + CH + 14} bend={i === 1 ? 0 : (i === 0 ? -60 : 60)} width={5} dot={false} />
          </React.Fragment>
        );
      })}

      {/* koperty lecące po łącznikach */}
      {CARDS.map((c, i) => {
        const p = prog(t, sendAt[i], 0.45);
        if (p <= 0 || p >= 1) return null;
        const [ex, ey] = bez(SRC.x, SRC.y, c.cx, CY + CH + 14, i === 1 ? 0 : (i === 0 ? -60 : 60), cubicOut(p));
        return <PixelArt key={i} grid={ENVELOPE} palette={ENV_PAL} unit={8} style={{ position: 'absolute', left: ex - 36, top: ey - 24, transform: `scale(${1 - 0.3 * p})` }} />;
      })}

      {t > 2.45 && (
        <div style={blurIn(t, 2.45, { dist: 30 })}>
          <Laptop x={LAP.x} y={LAP.y} s={LAP.s}>
            {[0.7, 0.45, 0.85, 0.6].map((w, r) => (
              <div key={r} style={{ position: 'absolute', left: 16, top: 22 + r * 34, height: 15, borderRadius: 6, background: r === 0 ? C.accent : 'rgba(255,255,255,.75)', width: 230 * w * clamp((t - 2.7 - r * 0.22) * 3) }} />
            ))}
          </Laptop>
        </div>
      )}

      <Clawd x={typing ? 860 : x} y={1150} u={10} t={t} lift={lift} squash={land * 0.2 + (typing ? pulse(t % 0.24, 0, 0.24) * 0.06 : 0)}
        walk={t > 0.9 && t < 2.4} flip={typing} look={!typing && t > 0.9 ? 1 : 0}
        arms={typing ? (Math.floor(t * 8) % 2 ? 'reach' : 'down') : 'rightUp'}
        hold={!typing ? { ...TOOLS.magnifier, px: 1.3, rot: 10 } : null} opacity={clamp(drop * 5)} />

      <Words t={t} at={2.75} text="i nawet napisze do nich" size={60} y={1205} />
      <HighlightBox t={t} at={3.2} text="za Ciebie" size={66} y={1288} />
    </>
  );
}
