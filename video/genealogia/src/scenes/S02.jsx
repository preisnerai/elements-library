// S02 — „i znaleźć krewnych, o których nie miałeś pojęcia?"
// Trzy puste karty „?". Clawd idzie z lupą, a karty, które mija, zamieniają się w nowych krewnych (akcent = znaleziony).
import React from 'react';
import { Words, Keyword, HighlightBox } from '../components/Text';
import { Clawd } from '../components/Clawd';
import { Person } from '../components/Family';
import { TOOLS } from '../components/props';
import { prog, cubicInOut, lerp } from '../lib/anim';

const G = [{ x: 230, kind: 'f' }, { x: 510, kind: 'om' }, { x: 790, kind: 'm' }];
const walkX = (t) => lerp(170, 850, cubicInOut(prog(t, 0.5, 1.7)));
const passAt = (cx) => { for (let f = 15; f < 75; f++) if (walkX(f / 30) >= cx) return f / 30; return 2.2; };

export default function S02({ t }) {
  const walking = t > 0.5 && t < 2.2;
  return (
    <>
      <Words t={t} at={0.05} text="i znaleźć" size={60} y={292} />
      <Keyword t={t} at={0.25} text="KREWNYCH" y={372} max={190} />
      {G.map((g, i) => <Person key={i} t={t} at={0.35 + i * 0.1} x={g.x} y={760} s={1.12} kind={g.kind} ghost reveal={passAt(g.x)} found />)}
      <Clawd x={walkX(t)} y={1150} u={9} t={t} walk={walking} look={walking ? 1 : 0} arms={t > 2.3 ? 'up' : 'rightUp'}
        hold={t <= 2.3 ? { ...TOOLS.magnifier, px: 1.3, rot: 10 } : null} lift={t > 2.3 ? Math.max(0, Math.sin((t - 2.3) * 9)) * 1.6 : 0} />
      <HighlightBox t={t} at={1.5} text="nie miałeś pojęcia?" size={64} y={1260} />
    </>
  );
}
