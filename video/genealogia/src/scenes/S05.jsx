// S05 — „Podajesz imię i nazwisko, miejsce, …, nazwiska panieńskie babć i każdego krewnego, jakiego pamiętasz"
// Clawd podaje dane jedną po drugiej: duży chip pojawia się nad nim i odlatuje do okna czatu, gdzie zostaje jako wiersz.
import React from 'react';
import { Words } from '../components/Text';
import { Card, Chip } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { Icon } from '../components/Family';
import { C } from '../lib/theme';
import { prog, expoOut, cubicInOut, clamp, lerp, blurIn, blurOut } from '../lib/anim';

const ITEMS = [
  { at: 0.25, label: 'imię i nazwisko', value: 'Jan Kowalski', icon: 'person' },
  { at: 1.65, label: 'skąd jest rodzina', value: 'Lublin', icon: 'pin' },
  { at: 3.05, label: 'nazwisko panieńskie babci', value: 'z d. Nowak', icon: 'heart' },
  { at: 4.55, label: 'krewni, których pamiętasz', value: 'wujek Staszek', icon: 'people' },
];
const CARD = { x: 160, y: 300, w: 760, h: 430 };
const ROW = (i) => ({ x: CARD.x + 40, y: CARD.y + 58 + 30 + i * 84 });
const FLY = 1.0, FLYDUR = 0.45;

export default function S05({ t }) {
  const toss = ITEMS.some((it) => t > it.at + FLY - 0.15 && t < it.at + FLY + 0.25);
  const done = t > ITEMS[3].at + FLY + FLYDUR;
  return (
    <>
      <Card t={t} at={0.05} x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} title="ChatGPT" />
      {ITEMS.map((it, i) => {
        const r = ROW(i), arrived = expoOut(prog(t, it.at + FLY + FLYDUR - 0.05, 0.3));
        return arrived > 0 && (
          <div key={'r' + i} style={{ position: 'absolute', left: r.x, top: r.y, display: 'flex', alignItems: 'center', gap: 22, opacity: arrived }}>
            <div style={{ width: 62, height: 62, borderRadius: 16, background: i === 0 ? C.accent : '#2A2A2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={it.icon} unit={5} /></div>
            <div style={{ height: 18, borderRadius: 9, background: 'rgba(255,255,255,.7)', width: (300 + i * 60) * arrived }} />
          </div>
        );
      })}
      {ITEMS.map((it, i) => {
        if (t < it.at || t > it.at + FLY + FLYDUR) return null;
        const f = cubicInOut(prog(t, it.at + FLY, FLYDUR)), r = ROW(i);
        const x = lerp(510, r.x + 31, f), y = lerp(880, r.y - 2, f), s = lerp(1, 0.38, f);
        return (
          <React.Fragment key={'c' + i}>
            <div style={f > 0 ? blurOut(t, it.at + FLY, { dur: 0.2 }) : {}}><Words t={t} at={it.at} text={it.label} size={48} y={780} color={C.muted} /></div>
            <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: '0 0', opacity: 1 - clamp((f - 0.8) * 5) }}>
              <Chip t={t} at={it.at + 0.12} x={0} y={0} center size={62} text={it.value} icon={<Icon name={it.icon} unit={8} />} />
            </div>
          </React.Fragment>
        );
      })}
      <Clawd x={510} y={1170} u={10} t={t} arms={toss || done ? 'up' : 'down'} lift={toss ? 1.6 : done ? Math.abs(Math.sin((t - 6) * 8)) * 1.4 : 0} squash={toss ? -0.08 : 0} />
    </>
  );
}
