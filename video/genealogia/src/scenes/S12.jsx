// S12 — „ChatGPT otwiera własną przeglądarkę i wraca z listą osób razem ze źródłami, które możesz sprawdzić."
// Okno przeglądarki: pasek wyszukiwania się ładuje, wjeżdża lista osób, przy każdej dokument-źródło, potem ptaszki „sprawdzone".
import React from 'react';
import { Words } from '../components/Text';
import { Card } from '../components/UI';
import { Clawd } from '../components/Clawd';
import { PixelArt } from '../components/Pixel';
import { FACES, Icon } from '../components/Family';
import { TOOLS } from '../components/props';
import { C } from '../lib/theme';
import { prog, expoOut, blurIn, backOut, clamp, pulse } from '../lib/anim';

const ROWS = [
  { name: 'Maria Kowalska', kind: 'of', at: 1.4, src: 2.9, ok: 4.0 },
  { name: 'Józef Kowalski', kind: 'om', at: 1.75, src: 3.1, ok: 4.35 },
  { name: 'Helena Nowak', kind: 'f', at: 2.1, src: 3.3, ok: 4.7 },
];

export default function S12({ t }) {
  const load = expoOut(prog(t, 0.4, 1.0));
  const hop = ROWS.reduce((m, r) => Math.max(m, pulse(t, r.ok - 0.1, 0.35)), 0);
  return (
    <>
      <Words t={t} at={0.05} text="ChatGPT otwiera **przeglądarkę**" size={60} y={292} />
      <Card t={t} at={0.15} x={110} y={390} w={800} h={660} title="szukam krewnych…" light>
        <div style={{ position: 'absolute', left: 32, right: 32, top: 26, height: 70, borderRadius: 35, background: '#E4E4E7', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${load * 100}%`, background: 'rgba(217,119,87,.28)' }} />
          <Icon name="db" unit={6} color={C.ink} style={{ position: 'absolute', left: 26, top: 14 }} />
          <div style={{ position: 'absolute', left: 90, top: 27, height: 16, borderRadius: 8, width: 380 * load, background: 'rgba(0,0,0,.35)' }} />
        </div>
        {ROWS.map((r, i) => {
          const y = 126 + i * 156, src = prog(t, r.src, 0.4), ok = prog(t, r.ok, 0.35);
          return (
            <div key={i} style={{ position: 'absolute', left: 32, top: y, width: 736, height: 130, ...blurIn(t, r.at, { dist: 30 }) }}>
              <div style={{ position: 'absolute', left: 0, top: 10, width: 110, height: 110, borderRadius: 22, background: C.card }}>
                <PixelArt grid={FACES[r.kind].grid} palette={FACES[r.kind].pal} unit={9} style={{ position: 'absolute', left: 10, top: 16 }} />
              </div>
              <div style={{ position: 'absolute', left: 136, top: 36, fontSize: 48, fontWeight: 700, color: C.ink, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>{r.name}</div>
              <div style={{ position: 'absolute', right: 0, top: 26, width: 132, height: 78, borderRadius: 22, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                opacity: clamp(src * 4), transform: `scale(${src > 0 ? 0.6 + 0.4 * backOut(src, 2.2) : 0.6})` }}>
                <Icon name="doc" unit={6} />
                <div style={{ width: 40, height: 40, borderRadius: 12, background: ok > 0 ? C.accent : '#3A3A3E', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.3 * pulse(t, r.ok, 0.3)})` }}>
                  {ok > 0 && <Icon name="check" unit={4} />}
                </div>
              </div>
              {i < 2 && <div style={{ position: 'absolute', left: 136, right: 0, bottom: -14, height: 2, background: 'rgba(0,0,0,.08)' }} />}
            </div>
          );
        })}
      </Card>
      <Clawd x={510} y={1180} u={9} t={t} arms="rightUp" hold={{ ...TOOLS.magnifier, px: 1.3, rot: 10 }} lift={hop * 1.6} look={t > 3.9 ? 1 : 0} />
    </>
  );
}
