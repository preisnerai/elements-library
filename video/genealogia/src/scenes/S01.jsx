// S01 — „Co się stanie, gdy każesz ChatGPT zbudować całe drzewo genealogiczne"
// Clawd = Ty. Ląduje na dole, a nad nim wyrasta drzewo: rodzice, potem dziadkowie. Clawd się cieszy.
import React from 'react';
import { Words, Keyword, HighlightBox } from '../components/Text';
import { Connector } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { Person } from '../components/Family';
import { prog, backOut, pulse, clamp } from '../lib/anim';

const H = 150;
const PAR = [{ x: 290, y: 860, kind: 'm', at: 1.3 }, { x: 730, y: 860, kind: 'f', at: 1.42 }];
const GP = [{ x: 195, y: 640, kind: 'om', at: 1.85, p: 0 }, { x: 385, y: 640, kind: 'of', at: 1.95, p: 0 }, { x: 635, y: 640, kind: 'om', at: 2.05, p: 1 }, { x: 825, y: 640, kind: 'of', at: 2.15, p: 1 }];

export default function S01({ t }) {
  const drop = prog(t, 0.15, 0.4), land = pulse(t, 0.52, 0.25);
  const lift = (drop < 1 ? (1 - backOut(drop, 1.2)) * 50 : 0) + pulse(t, 2.6, 0.4) * 2.2 + pulse(t, 3.1, 0.4) * 2.2;
  const cheer = t > 2.5 && t < 3.6;
  return (
    <>
      <Words t={t} at={0.05} text="Każesz **ChatGPT** zbudować" size={60} y={292} />
      <Keyword t={t} at={0.9} text="DRZEWO" y={372} max={190} />
      {PAR.map((p, i) => <Connector key={'c' + i} t={t} at={1.15} dur={0.35} x1={p.x} y1={p.y + H / 2} x2={510} y2={1060} bend={i ? -40 : 40} width={5} dot={false} />)}
      {GP.map((g, i) => <Connector key={'g' + i} t={t} at={g.at - 0.1} dur={0.3} x1={g.x} y1={g.y + H / 2} x2={PAR[g.p].x} y2={PAR[g.p].y - H / 2} bend={0} width={5} dot={false} />)}
      {PAR.map((p, i) => <Person key={'p' + i} t={t} at={p.at} x={p.x} y={p.y} kind={p.kind} />)}
      {GP.map((g, i) => <Person key={'gp' + i} t={t} at={g.at} x={g.x} y={g.y} kind={g.kind} />)}
      <Clawd x={510} y={1150} u={9} t={t} lift={lift} squash={land * 0.2} arms={cheer ? 'up' : 'down'} look={t > 1.2 && t < 2.4 ? (t < 1.8 ? -1 : 1) : 0} opacity={clamp(drop * 5)} />
      <HighlightBox t={t} at={2.9} text="genealogiczne" size={66} y={1260} />
    </>
  );
}
