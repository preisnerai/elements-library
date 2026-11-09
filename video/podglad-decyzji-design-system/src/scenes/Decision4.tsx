import React from "react";
import { C, DARKS, PICK_AT } from "../constants";
import { Option } from "../option";
import { Frame, Reveal } from "../ui";

const Panel: React.FC<{ bg: string }> = ({ bg }) => (
  <div
    style={{
      width: 382,
      height: 400,
      background: bg,
      borderRadius: 16,
      border: "1px solid rgba(23,23,23,0.3)",
      padding: "34px 30px",
      color: "#f4f4f2",
    }}
  >
    <div style={{ fontSize: 48, fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.02em" }}>
      Mniej chaosu, więcej czasu.
    </div>
    <div style={{ fontSize: 24, lineHeight: 1.4, marginTop: 22, color: "rgba(244,244,242,0.62)" }}>
      Procesy, które pracują za Ciebie.
    </div>
    <div style={{ marginTop: 30, width: 120, height: 3, background: "rgba(244,244,242,0.35)" }} />
  </div>
);

const ITEMS = [
  { l: "A", name: "Grafit", note: "Neutralny, bez odcienia.", hex: DARKS.A },
  { l: "B", name: "Głęboka czerń", note: "Najciemniejszy z czterech.", hex: DARKS.B },
  { l: "C", name: "Czerń chłodna", note: "Lekko niebieskawa.", hex: DARKS.C },
  { l: "D", name: "Ciemny granat", note: "Szaro-niebieski.", hex: DARKS.D },
];

export const Decision4: React.FC = () => (
  <Frame
    step={4}
    title="Decyzja 4 z 4: Ciemne tło"
    subtitle="Ten sam napis na czterech ciemnych tłach."
    question="Które wolisz: A, B, C czy D?"
    rec={{ at: PICK_AT, main: "Rekomendacja: A", sub: "Pasuje do ciemnych sekcji strony" }}
  >
    <Reveal at={0.9}>
      <div style={{ fontSize: 34, marginBottom: 22, color: C.ink }}>
        Dziś w kodzie jest 4 różne ciemne tła. Zostaje jedno.
      </div>
    </Reveal>
    <div style={{ display: "flex", gap: 16, justifyContent: "space-between" }}>
      {ITEMS.map((it, i) => (
        <Option
          key={it.l}
          letter={it.l}
          name={it.name}
          delay={1.4 + i * 0.15}
          picked={i === 0}
          width={414}
          note={it.note}
          tiny={it.hex}
        >
          <Panel bg={it.hex} />
        </Option>
      ))}
    </div>
  </Frame>
);
