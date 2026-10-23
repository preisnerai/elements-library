// S01 — „Claude potrafi zamienić się w całe studio gier i nie musisz pisać ani linijki kodu."
import React from 'react';
import { Words, Keyword, HighlightBox } from '../components/Text';
import { Card, CodeLines } from '../components/UI';
import { GameScreen } from '../components/GameScreen';
import { Clawd } from '../components/Clawd';
import { HATS } from '../components/props';
import { prog, backOut, expoOut, blurIn, blurOut, pulse, clamp } from '../lib/anim';

export default function S01({ t }) {
  // Clawd spada z góry i ląduje z „zgnieceniem", potem cieszy się w słuchawkach (studio)
  const drop = prog(t, 0.15, 0.45), land = pulse(t, 0.58, 0.25);
  const lift = drop < 1 ? (1 - backOut(drop, 1.2)) * 60 : 0;
  const cheer = t > 1.25 && t < 2.2;
  const shake = t > 3.5 && t < 4.6 ? (Math.floor(t * 6) % 2 ? -1 : 1) : 0;   // „nie" — oczy w lewo/prawo
  const del = prog(t, 3.45, 1.15);   // linie kodu znikają po kolei (jak backspace)
  return (
    <>
      <Words t={t} at={0.05} text="Claude potrafi zamienić się w **całe**" size={58} y={292} />
      <Keyword t={t} at={0.5} text="STUDIO GIER" y={372} max={190} />
      <Card t={t} at={0.85} x={150} y={620} w={720} h={470} title="moja-gra">
        <GameScreen variant="color" t={t} w={720} h={412} />
      </Card>
      {t > 2.9 && (
        <div style={{ ...blurIn(t, 2.95, { dist: 40 }), ...(t > 4.75 ? blurOut(t, 4.75) : {}) }}>
          <Card t={9} at={0} x={100} y={560} w={470} h={330} title="kod.js">
            <CodeLines x={22} y={22} w={420} rows={6} deleted={del} />
          </Card>
          <div style={{ position: 'absolute', left: 90, top: 712, width: 490 * expoOut(prog(t, 4.25, 0.35)), height: 12, background: '#D97757', transform: 'rotate(-12deg)', transformOrigin: '0 50%', borderRadius: 6 }} />
        </div>
      )}
      <Clawd x={770} y={1150} u={12} t={t} lift={lift} squash={land * 0.22 - (drop < 1 ? 0.08 : 0)} arms={cheer ? 'up' : 'down'} look={shake || (t > 2.95 && t < 3.5 ? -1 : 0)}
        hat={t > 1.0 ? HATS.headset : null} opacity={clamp(drop * 5)} />
      <Words t={t} at={2.85} text="i nie musisz pisać" size={60} y={1205} />
      <HighlightBox t={t} at={3.25} text="ani linijki kodu" size={66} y={1288} />
    </>
  );
}
