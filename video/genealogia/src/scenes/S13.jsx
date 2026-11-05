// S13 — bonus, prompt 4: „poproś o pełne wizualne drzewo ze wszystkimi znalezionymi osobami i z tym, jak jesteście połączeni."
// Powrót motywu z S01, ale większy: znane osoby + znalezieni (puste „?" → osoby z akcentem), na końcu dorysowują się połączenia.
import React from 'react';
import { Kicker, Keyword, HighlightBox } from '../components/Text';
import { Connector } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { Person } from '../components/Family';
import { C } from '../lib/theme';
import { prog, expoOut } from '../lib/anim';

const S = 0.75, H = 150 * S;
const A = 610, B = 790, CY = 990;
const N = {
  a0: { x: 180, y: A, kind: 'om', at: 1.3 }, a1: { x: 360, y: A, kind: 'of', at: 1.4 }, a2: { x: 660, y: A, kind: 'om', at: 1.5 }, a3: { x: 840, y: A, kind: 'of', at: 1.6 },
  b1: { x: 390, y: B, kind: 'm', at: 1.0 }, b2: { x: 630, y: B, kind: 'f', at: 1.1 },
  b0: { x: 200, y: B, kind: 'f', at: 2.3, ghost: true, reveal: 3.3 }, b3: { x: 820, y: B, kind: 'm', at: 2.4, ghost: true, reveal: 3.6 },
  c0: { x: 200, y: CY, kind: 'm', at: 2.5, ghost: true, reveal: 3.9 }, c1: { x: 820, y: CY, kind: 'f', at: 2.6, ghost: true, reveal: 4.2 },
};
const Couple = ({ t, at, a, b }) => <div style={{ position: 'absolute', left: a.x + H / 2, top: a.y - 2.5, width: (b.x - a.x - H) * expoOut(prog(t, at, 0.3)), height: 5, background: C.ink }} />;
const E = (t, at, x1, y1, n, key, bend = 0) => <Connector key={key} t={t} at={at} dur={0.35} x1={x1} y1={y1} x2={n.x} y2={n.y - H / 2} bend={bend} width={5} dot={false} />;

export default function S13({ t }) {
  const jump = t > 5.5 && t < 6.6;
  return (
    <>
      <Kicker t={t} at={0.05} text="BONUS · PROMPT 4" y={265} size={44} />
      <Keyword t={t} at={0.45} text="PEŁNE DRZEWO" y={340} max={160} />
      <Couple t={t} at={1.25} a={N.b1} b={N.b2} />
      <Couple t={t} at={1.6} a={N.a0} b={N.a1} />
      <Couple t={t} at={1.7} a={N.a2} b={N.a3} />
      <Connector t={t} at={1.15} dur={0.3} x1={510} y1={B} x2={510} y2={1072} bend={0} width={5} dot={false} />
      {E(t, 1.75, 270, A, N.b1, 'e1')}
      {E(t, 1.85, 750, A, N.b2, 'e2')}
      {E(t, 4.9, 270, A, N.b0, 'f1')}
      {E(t, 5.0, 750, A, N.b3, 'f2')}
      {E(t, 5.15, N.b0.x, B + H / 2, N.c0, 'f3')}
      {E(t, 5.25, N.b3.x, B + H / 2, N.c1, 'f4')}
      {Object.entries(N).map(([k, n]) => <Person key={k} t={t} at={n.at} x={n.x} y={n.y} s={S} kind={n.kind} ghost={n.ghost} reveal={n.reveal ?? null} found={!!n.ghost} />)}
      <Clawd x={510} y={1150} u={8} t={t} arms={jump ? 'up' : 'down'} lift={jump ? Math.abs(Math.sin((t - 5.5) * 8)) * 1.6 : 0} look={t > 3.2 && t < 4.6 ? (t < 3.9 ? -1 : 1) : 0} />
      <HighlightBox t={t} at={5.0} text="jak jesteście połączeni" size={60} y={1215} />
    </>
  );
}
