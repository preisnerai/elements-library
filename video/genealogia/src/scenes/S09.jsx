// S09 — „ChatGPT zbiera historię stojącą za Twoim nazwiskiem."
// Przykład: KOWALSKI ← „kowal". Clawd kuje młotem na kowadle, lecą iskry.
import React from 'react';
import { Words, Keyword, HighlightBox } from '../components/Text';
import { Clawd } from '../components/Clawd';
import { PixelArt } from '../components/Pixel';
import { TOOLS } from '../components/props';
import { C } from '../lib/theme';
import { prog, lerp, clamp } from '../lib/anim';

const ANVIL = ['kkkkkkkkkkkkkk', '.kkkkkkkkkkkkk', '...kkkkkkkk...', '.....kkkk.....', '.....kkkk.....', '...kkkkkkkk...', '..kkkkkkkkkk..'];
const AX = 420, AY = 1010, U = 14;                    // kowadło: 196×98 px, górna krawędź y = AY
const PERIOD = 0.5, START = 0.45;

export default function S09({ t }) {
  const ph = t > START ? ((t - START) % PERIOD) / PERIOD : 0;
  const rot = t > START ? (ph < 0.65 ? lerp(-80, 20, ph / 0.65) : lerp(20, -80, (ph - 0.65) / 0.35)) : -80;
  const hitT = t > START ? (t - START) % PERIOD - 0.65 * PERIOD : -1;    // czas od uderzenia
  const sparks = hitT > 0 && hitT < 0.25;
  return (
    <>
      <Words t={t} at={0.05} text="historia nazwiska" size={60} y={292} />
      <Keyword t={t} at={0.25} text="KOWALSKI" y={372} max={190} />
      <PixelArt grid={ANVIL} palette={{ k: C.card }} unit={U} style={{ position: 'absolute', left: AX - 98, top: AY }} />
      {sparks && [[-1, -1.3], [-0.4, -1.8], [0.5, -1.6], [1.2, -1.1], [0.1, -2.1]].map(([dx, dy], i) => {
        const k = hitT / 0.25;
        return <div key={i} style={{ position: 'absolute', left: AX + 40 + dx * 140 * k, top: AY - 10 + dy * 110 * k + 120 * k * k, width: 22, height: 22, background: i % 2 ? C.accent : C.ink, opacity: 1 - k }} />;
      })}
      <Clawd x={640} y={AY + 98} u={11} t={t} flip arms="rightUp" hold={{ ...TOOLS.hammer, px: 2.2, rot }} squash={sparks ? 0.06 : 0} />
      <HighlightBox t={t} at={1.2} text="od słowa „kowal”" size={64} y={1240} />
    </>
  );
}
