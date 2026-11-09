import React from "react";
import { C } from "../constants";
import { Letter } from "../option";
import { Frame, Reveal } from "../ui";

const ROWS = [
  { d: "Decyzja 1", name: "Papier i atrament", pick: "A", what: "Obecna strona, ciepła szarość", tiny: "tło #f4f4f2, tekst #171717" },
  { d: "Decyzja 2", name: "Akcent w wideo", pick: "A", what: "Bez akcentu, spójnie ze stroną", tiny: "B ewentualnie jako wyjątek, tylko w wideo" },
  { d: "Decyzja 3", name: "Krój pisma", pick: "A", what: "General Sans wszędzie", tiny: "ten sam krój co dziś na stronie" },
  { d: "Decyzja 4", name: "Ciemne tło", pick: "A", what: "Jedno ciemne tło, grafit", tiny: "#111111, jak ciemne sekcje strony" },
];

export const Summary: React.FC = () => (
  <Frame
    step={4}
    title="Podsumowanie: moje 4 rekomendacje"
    subtitle="Cztery decyzje, w każdej polecam wariant A."
    question="Jeśli się zgadzasz, odpisz: tak, tak, tak, tak"
    questionSize={50}
    rec={{ at: 4, main: "Albo same litery", sub: "A, A, A, A" }}
  >
    <div style={{ paddingTop: 8 }}>
      {ROWS.map((r, i) => (
        <Reveal key={r.d} at={0.8 + i * 0.5}>
          <div
            style={{
              height: 156,
              display: "flex",
              alignItems: "center",
              gap: 40,
              borderBottom: `1px solid ${C.hairline}`,
              padding: "0 12px",
            }}
          >
            <div style={{ width: 520, flexShrink: 0 }}>
              <div style={{ fontSize: 24, color: C.muted }}>{r.d} z 4</div>
              <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em" }}>{r.name}</div>
            </div>
            <Letter letter={r.pick} size={96} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 46, fontWeight: 500 }}>{r.what}</div>
              <div style={{ fontSize: 26, color: C.muted, marginTop: 6 }}>{r.tiny}</div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </Frame>
);
