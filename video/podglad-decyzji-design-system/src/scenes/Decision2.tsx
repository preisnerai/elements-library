import React from "react";
import { ACCENT, C, PICK_AT, VIDEO_DARK } from "../constants";
import { Option } from "../option";
import { Frame, Reveal } from "../ui";

const Card: React.FC<{ color: string; underline?: boolean }> = ({ color, underline }) => (
  <div
    style={{
      width: 270,
      height: 480,
      borderRadius: 20,
      background: VIDEO_DARK,
      position: "relative",
      border: "1px solid rgba(23,23,23,0.3)",
      color: "#f4f4f2",
    }}
  >
    <div style={{ position: "absolute", left: 22, top: 20, fontSize: 15, opacity: 0.5, letterSpacing: "0.1em" }}>
      PREISCALE
    </div>
    <div style={{ position: "absolute", left: 22, right: 22, top: 170, fontSize: 56, lineHeight: 1.08, letterSpacing: "-0.02em" }}>
      <div style={{ fontWeight: 400 }}>Wąskie</div>
      <div
        style={{
          fontWeight: 600,
          color,
          textDecoration: underline ? "underline" : "none",
          textDecorationThickness: 4,
          textUnderlineOffset: 8,
        }}
      >
        gardło
      </div>
    </div>
    <div style={{ position: "absolute", left: 22, right: 22, bottom: 26, height: 3, background: "rgba(244,244,242,0.25)" }}>
      <div style={{ width: "40%", height: 3, background: "#f4f4f2" }} />
    </div>
  </div>
);

export const Decision2: React.FC = () => (
  <Frame
    step={2}
    title="Decyzja 2 z 4: Akcent w wideo"
    subtitle="Ten sam kadr wideo, trzy sposoby wyróżnienia jednego słowa."
    question="Które wolisz: A, B czy C?"
    rec={{ at: PICK_AT, main: "Rekomendacja: A, spójnie ze stroną", sub: "B tylko jako wyjątek w wideo" }}
  >
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <Reveal at={0.9} style={{ width: 520, marginTop: 16 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.ink}`, borderRadius: 20, padding: "30px 32px" }}>
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em" }}>Co to jest akcent?</div>
          <div style={{ fontSize: 31, lineHeight: 1.35, marginTop: 14 }}>
            Jeden kolor-wyróżnik, np. jedno słowo na ekranie.
          </div>
          <div style={{ fontSize: 31, lineHeight: 1.35, marginTop: 14, color: C.muted }}>
            Strona nie ma żadnego, jest czarno-biała.
          </div>
        </div>
      </Reveal>
      <Option letter="A" name="Bez akcentu" delay={1.8} picked width={364} note="Grubość i podkreślenie" tiny="biel na ciemnym tle">
        <Card color="#f4f4f2" underline />
      </Option>
      <Option letter="B" name="Bursztyn" delay={2.0} width={364} note="Słowo w ciepłym kolorze" tiny={ACCENT.amber}>
        <Card color={ACCENT.amber} />
      </Option>
      <Option letter="C" name="Żółty" delay={2.2} width={364} note="Słowo w mocnym żółtym" tiny={ACCENT.yellow}>
        <Card color={ACCENT.yellow} />
      </Option>
    </div>
  </Frame>
);
