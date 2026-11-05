// S07 — prompt 2: „zostajesz w tym samym czacie i piszesz: na podstawie mojego nazwiska i miejsca…"
// Clawd ląduje na oknie czatu i wbija w nie flagę („zostaję tu"). U góry widać poprzednią wymianę, poniżej pisze się nowy prompt.
import React from 'react';
import { Kicker, HighlightBox } from '../components/Text';
import { Card } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { Bubble } from '../components/Family';
import { TOOLS } from '../components/props';
import { C } from '../lib/theme';
import { prog, backOut, pulse, clamp, expoOut } from '../lib/anim';

const PROMPT = 'Na podstawie mojego nazwiska i miejsca, skąd pochodzi moja rodzina, powiedz mi, jaki jest początek mojego rodu i jak daleko wstecz da się go prześledzić.';
const CARD = { x: 110, y: 380, w: 800, h: 740 };

export default function S07({ t }) {
  const drop = prog(t, 0.25, 0.4), land = pulse(t, 0.62, 0.25);
  const lift = drop < 1 ? (1 - backOut(drop, 1.2)) * 40 : 0;
  const flag = t > 0.95;
  const old = expoOut(prog(t, 0.2, 0.4));
  return (
    <>
      <Kicker t={t} at={0.05} text="PROMPT 2" y={275} size={44} />
      <Card t={t} at={0.1} x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} title="ChatGPT">
        {/* poprzednia wymiana, przygaszona: prompt 1 i mini-drzewo */}
        <div style={{ opacity: 0.45 * old }}>
          <div style={{ position: 'absolute', right: 40, top: 30, width: 380, height: 54, borderRadius: 27, background: '#F3F3F3' }} />
          <svg width={260} height={110} style={{ position: 'absolute', left: 40, top: 30 }}>
            {[[30, 10], [80, 10], [180, 10], [230, 10], [55, 50], [205, 50], [130, 88]].map(([x, y], i) => <rect key={i} x={x - 14} y={y} width={28} height={22} rx={6} fill="#F3F3F3" />)}
            <path d="M55 72 L130 88 M205 72 L130 88 M30 32 L55 50 M80 32 L55 50 M180 32 L205 50 M230 32 L205 50" stroke="#F3F3F3" strokeWidth={3} fill="none" />
          </svg>
        </div>
        <div style={{ position: 'absolute', left: 40, right: 40, top: 160, height: 3, background: 'rgba(255,255,255,.12)', transform: `scaleX(${old})` }} />
        <Bubble t={t} at={1.6} text={PROMPT} x={140} y={190} w={620} size={44} cps={40} />
      </Card>
      <Clawd x={760} y={CARD.y} u={8} t={t} lift={lift} squash={land * 0.2} opacity={clamp(drop * 5)} arms={flag ? 'rightUp' : 'down'}
        hold={flag ? { ...TOOLS.flag, px: 1.5 } : null} />
      <HighlightBox t={t} at={0.7} text="ten sam czat" size={60} y={1160} />
    </>
  );
}
