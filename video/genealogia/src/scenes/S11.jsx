// S11 — „znajdź krewnych, których jeszcze nie mam, i przy każdej osobie podaj źródło."
// Prompt pisze się w czacie; pod nim pusta karta „?" staje się nową osobą, a łącznik prowadzi do chipa „źródło".
import React from 'react';
import { Kicker } from '../components/Text';
import { Card, Chip, Connector } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { Bubble, Person, Icon } from '../components/Family';
import { TOOLS } from '../components/props';

const PROMPT = 'Znajdź krewnych, których jeszcze nie mam, i przy każdej osobie podaj źródło.';

export default function S11({ t }) {
  const late = t > 3.5;
  return (
    <>
      <Kicker t={t} at={0.05} text="PROMPT 3" y={265} size={44} />
      <Card t={t} at={0.1} x={110} y={340} w={800} h={440} title="ChatGPT">
        <Bubble t={t} at={0.35} text={PROMPT} x={140} y={34} w={620} size={46} cps={22} />
      </Card>
      <Person t={t} at={1.6} x={300} y={985} s={1} kind="of" ghost reveal={2.5} found />
      <Connector t={t} at={3.55} dur={0.35} x1={380} y1={985} x2={600} y2={985} bend={-50} width={5} dot />
      <Chip t={t} at={3.85} x={612} y={931} size={54} text="źródło" accent icon={<Icon name="link" unit={8} />} />
      <Clawd x={510} y={1180} u={8} t={t} arms="rightUp" look={late ? 1 : -1} hold={{ ...TOOLS.magnifier, px: 1.3, rot: 10 }}
        lift={t > 2.5 && t < 2.9 ? 1.4 : t > 3.9 && t < 4.3 ? 1.4 : 0} />
    </>
  );
}
