// S06 — „a ChatGPT układa z tego czyste drzewo wyjściowe."
// W oknie czatu składa się drzewo (od dołu: Ty → rodzice → dziadkowie). Clawd podaje ręce do okna, potem się cieszy.
import React from 'react';
import { Words, HighlightBox } from '../components/Text';
import { Card, Connector } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { Person } from '../components/Family';
import { C } from '../lib/theme';

const S = 0.66, H = 150 * S, LINE = 'rgba(255,255,255,.55)';
const ME = { x: 510, y: 930, kind: 'm', at: 0.35, found: true };
const PAR = [{ x: 350, y: 750, kind: 'm', at: 0.6 }, { x: 670, y: 750, kind: 'f', at: 0.7 }];
const GP = [{ x: 260, y: 570, kind: 'om', at: 0.9, p: 0 }, { x: 440, y: 570, kind: 'of', at: 0.98, p: 0 }, { x: 580, y: 570, kind: 'om', at: 1.06, p: 1 }, { x: 760, y: 570, kind: 'of', at: 1.14, p: 1 }];

export default function S06({ t }) {
  const happy = t > 1.6;
  return (
    <>
      <Words t={t} at={0.05} text="**ChatGPT** układa" size={60} y={292} />
      <Card t={t} at={0.1} x={150} y={400} w={720} h={640} title="drzewo wyjściowe" light />
      {PAR.map((p, i) => <Connector key={'c' + i} t={t} at={p.at} dur={0.3} x1={p.x} y1={p.y + H / 2} x2={ME.x} y2={ME.y - H / 2} bend={i ? -30 : 30} width={4} color={C.ink} dot={false} />)}
      {GP.map((g, i) => <Connector key={'g' + i} t={t} at={g.at} dur={0.3} x1={g.x} y1={g.y + H / 2} x2={PAR[g.p].x} y2={PAR[g.p].y - H / 2} bend={0} width={4} color={C.ink} dot={false} />)}
      {[ME, ...PAR, ...GP].map((n, i) => <Person key={i} t={t} at={n.at} x={n.x} y={n.y} s={S} kind={n.kind} found={n.found} />)}
      <Clawd x={820} y={1170} u={8} t={t} flip={!happy} arms={happy ? 'up' : 'reach'} lift={happy ? Math.abs(Math.sin((t - 1.6) * 8)) * 1.4 : 0} />
      <HighlightBox t={t} at={1.5} text="czyste drzewo wyjściowe" size={60} y={1240} />
    </>
  );
}
