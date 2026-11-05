// S10 — prompt 3: „Teraz sztuczka. … przeszukaj rejestry publiczne, bazy genealogiczne i nekrologi"
// Clawd-magik w cylindrze macha różdżką; z kapelusza wylatują trzy źródła, każde w chwili, gdy pada jego nazwa.
import React from 'react';
import { Kicker, Keyword } from '../components/Text';
import { Chip } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { Icon } from '../components/Family';
import { starPath } from '../components/Background';
import { C } from '../lib/theme';
import { prog, expoOut, lerp, clamp, blurOut } from '../lib/anim';

const TOPHAT = { grid: ['..kkkkkk..', '..kkkkkk..', '..kkkkkk..', '..aaaaaa..', 'kkkkkkkkkk'], palette: { k: '#1B1B1D', a: '#D97757' }, px: 1, dx: 4, dy: -5 };
const WAND = { grid: ['w', 'k', 'k', 'k', 'k', 'k'], palette: { w: '#F3F3F3', k: '#1B1B1D' }, px: 1.3, ax: 0, ay: 5 };
const SRC = [{ at: 2.6, text: 'rejestry publiczne', icon: 'doc', y: 600 }, { at: 3.6, text: 'bazy genealogiczne', icon: 'db', y: 730 }, { at: 4.5, text: 'nekrologi', icon: 'candle', y: 860 }];
const HAT = { x: 510, y: 1060 };

export default function S10({ t }) {
  const wave = Math.sin(t * 9) * 25;
  const casting = (t > 0.5 && t < 1.5) || SRC.some((s) => t > s.at - 0.2 && t < s.at + 0.3);
  return (
    <>
      <div style={t > 2.3 ? blurOut(t, 2.3) : {}}><Kicker t={t} at={0.05} text="PROMPT 3" y={275} size={44} /></div>
      <Keyword t={t} at={0.15} text="SZTUCZKA" y={345} max={190} />
      {SRC.map((s, i) => {
        const f = expoOut(prog(t, s.at, 0.55));
        if (f <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${HAT.x}px, ${lerp(HAT.y, s.y, f)}px) scale(${lerp(0.3, 1, f)})`, transformOrigin: '0 0', opacity: clamp(f * 4) }}>
            <Chip t={t} at={s.at} x={0} y={0} center size={54} text={s.text} icon={<Icon name={s.icon} unit={8} />} />
          </div>
        );
      })}
      {casting && [0, 1, 2, 3].map((i) => {
        const k = ((t * 3 + i * 0.25) % 1);
        return <svg key={i} width={40} height={40} style={{ position: 'absolute', left: 590 + Math.cos(i * 1.7) * 60 * k - 20, top: 1000 - 70 * k + Math.sin(i * 2.3) * 30 - 20, opacity: 1 - k }}>
          <path transform="translate(20,20)" d={starPath(4, 18, 6)} fill={i % 2 ? C.accent : C.ink} /></svg>;
      })}
      <Clawd x={510} y={1180} u={10} t={t} hat={TOPHAT} arms="rightUp" hold={{ ...WAND, rot: casting ? wave : 10 }} lift={casting ? 0.8 : 0} />
    </>
  );
}
