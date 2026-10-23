// Sekwencer: sceny z script.json, przejścia przez rozmycie kadru + impuls gwiazd w tle.
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, delayRender, continueRender } from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import S from '../script.json';
import { Background } from './components/Background';
import { SCENES } from './scenes';
import { prog, cubicOut, expoOut, pulse, clamp } from './lib/anim';
import { Words } from './components/Text';

export const TR = 0.3;   // zakładka przejścia (s)
export const timeline = () => { let start = 0; return S.scenes.map((s) => { const it = { ...s, start }; start += s.dur; return it; }); };
export const totalDuration = () => S.scenes.reduce((a, s) => a + s.dur, 0);

const Placeholder = ({ t, say }) => <Words t={t} at={0} text={say} size={56} y={760} width={820} />;

const SceneWrap = ({ Comp, it, first, last }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  const inP = first ? 1 : expoOut(prog(t, 0, 0.4));
  const outP = last ? 0 : cubicOut(prog(t, it.dur - 0.02, TR));
  const blur = (1 - inP) * 22 + outP * 26;
  return (
    <AbsoluteFill style={{ opacity: clamp(inP * 2) * (1 - outP), filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined, transform: `scale(${(0.97 + 0.03 * inP) * (1 + 0.05 * outP)})`, transformOrigin: '510px 840px' }}>
      <Comp t={t} dur={it.dur} say={it.say} />
    </AbsoluteFill>
  );
};

export const Video = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const T = frame / fps;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const sample = 'AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWXYZŹŻ aąbcćdeęfghijklłmnńoóprsśtuwxyzźż 0123456789';
    Promise.all(['400', '700'].map((w) => document.fonts.load(`${w} 64px Inter`, sample))).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  if (!ready) return null;
  const items = timeline();
  const kick = items.slice(1).reduce((m, it) => Math.max(m, pulse(T, it.start - 0.3, 0.75)), 0);
  return (
    <AbsoluteFill style={{ fontFamily: 'Inter', color: '#0F0F10' }}>
      <Background t={T} kick={kick} />
      {items.map((it, i) => (
        <Sequence key={it.id} from={Math.round(it.start * fps)} durationInFrames={Math.round((it.dur + (i < items.length - 1 ? TR : 0)) * fps)}>
          <SceneWrap Comp={SCENES[it.id] || Placeholder} it={it} first={i === 0} last={i === items.length - 1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
