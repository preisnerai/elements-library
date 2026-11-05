// S15 — CTA: „Jeżeli chcesz wszystkie cztery prompty do skopiowania, zaobserwuj i skomentuj RODZINA."
// Clawd wskakuje na przycisk „Zaobserwuj" (wciska go), potem w komentarzu pisze się RODZINA i leci „wyślij".
import React from 'react';
import { Words } from '../components/Text';
import { Clawd } from '../components/Clawd';
import { Icon } from '../components/Family';
import { C } from '../lib/theme';
import { prog, expoOut, backOut, clamp, pulse, cubicInOut, lerp, typed, blurIn } from '../lib/anim';

const BTN = { y: 880, h: 116 };
const JUMP = 2.2, LAND = 2.65;

export default function S15({ t }) {
  const drop = prog(t, 0.15, 0.4);
  const j = prog(t, JUMP, LAND - JUMP);
  const cy = t < JUMP ? 1180 : lerp(1180, BTN.y, cubicInOut(j)) - Math.sin(Math.PI * j) * 160;
  const pressed = t > LAND, sq = pulse(t, LAND, 0.25);
  const card = expoOut(prog(t, 0.35, 0.5));
  const word = typed('RODZINA', t, 3.0, 11), typing = t > 3.0 && word.length < 7;
  const sent = pulse(t, 3.85, 0.4);
  const btnP = prog(t, 1.3, 0.45);
  return (
    <>
      <Words t={t} at={0.05} text="Chcesz wszystkie **4** **prompty**?" size={60} y={292} />
      {/* pole komentarza */}
      <div style={{ position: 'absolute', left: 130, top: 450, width: 760, height: 230, borderRadius: 40, background: '#FAFAFA', boxShadow: '0 40px 80px rgba(0,0,0,.18), 0 12px 24px rgba(0,0,0,.1)',
        opacity: clamp(card * 3), transform: `translateY(${(1 - card) * 60}px) scale(${1 + 0.03 * sent})` }}>
        <div style={{ position: 'absolute', left: 40, top: 40, fontSize: 40, fontWeight: 700, color: C.muted, letterSpacing: '0.04em' }}>KOMENTARZ</div>
        <div style={{ position: 'absolute', left: 40, top: 92, fontSize: 104, fontWeight: 700, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {word}<span style={{ display: 'inline-block', width: 7, height: 92, marginLeft: 6, background: C.accent, verticalAlign: '-0.08em', opacity: t < 3.95 && (typing || Math.floor(t * 4) % 2) ? 1 : 0 }} />
        </div>
        <div style={{ position: 'absolute', right: 34, bottom: 34, width: 96, height: 96, borderRadius: 28, background: word.length === 7 ? C.accent : '#D6D6D9', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.25 * sent})` }}>
          <svg width={44} height={44} viewBox="0 0 44 44"><path d="M22 36 V8 M10 20 L22 8 L34 20" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="square" /></svg>
        </div>
      </div>
      {/* przycisk obserwuj */}
      <div style={{ position: 'absolute', left: 510, top: BTN.y, transform: `translateX(-50%) scale(${btnP > 0 ? 0.6 + 0.4 * backOut(btnP, 2.2) : 0.6}, ${(btnP > 0 ? 0.6 + 0.4 * backOut(btnP, 2.2) : 0.6) * (1 - sq * 0.18)})`, transformOrigin: '50% 100%', opacity: clamp(btnP * 4),
        height: BTN.h, padding: '0 54px', borderRadius: 34, background: pressed ? C.card : C.accent, color: '#fff', display: 'flex', alignItems: 'center', gap: 22, fontSize: 58, fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap', boxShadow: '0 24px 48px rgba(0,0,0,.22)' }}>
        {pressed && <Icon name="check" unit={7} />}{pressed ? 'Obserwujesz' : 'Zaobserwuj'}
      </div>
      <Clawd x={510} y={cy} u={9} t={t} opacity={clamp(drop * 5)} lift={drop < 1 ? (1 - backOut(drop, 1.2)) * 40 : 0}
        arms={t > JUMP && t < LAND ? 'up' : t > 3.9 ? 'up' : 'down'} squash={sq * 0.22} look={t > 2.9 && t < 3.9 ? -1 : 0} style={{ zIndex: 2 }} />
    </>
  );
}
