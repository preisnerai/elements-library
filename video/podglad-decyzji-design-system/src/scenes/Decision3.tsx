import React from "react";
import { C, PICK_AT } from "../constants";
import { FAMILIES } from "../fonts";
import { Letter } from "../option";
import { Frame, Reveal, useProgress } from "../ui";

const SENTENCE = "Procesy, które pracują za Ciebie";

const ROWS = [
  { l: "A", name: "General Sans", feel: "neutralny, nowoczesny", used: "dziś na stronie", fam: FAMILIES.generalSans, w: 500, size: 60 },
  { l: "B", name: "Inter", feel: "bezpieczny, ekranowy", used: "dziś w wideo", fam: FAMILIES.inter, w: 500, size: 58 },
  { l: "C", name: "Barlow Condensed", feel: "wąski, plakatowy", used: "dziś w wideo", fam: FAMILIES.barlow, w: 500, size: 66 },
  { l: "D", name: "EB Garamond", feel: "szeryfowy, książkowy", used: "dziś w wideo", fam: FAMILIES.garamond, w: 500, size: 66 },
  { l: "E", name: "Manrope", feel: "okrągły, przyjazny", used: "dziś w aplikacji", fam: FAMILIES.manrope, w: 500, size: 58 },
];

const Row: React.FC<(typeof ROWS)[number] & { i: number }> = ({ l, name, feel, used, fam, w, size, i }) => {
  const p = useProgress(PICK_AT);
  const picked = i === 0;
  return (
    <Reveal at={0.9 + i * 0.15}>
      <div
        style={{
          position: "relative",
          height: 112,
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: "0 24px",
          borderBottom: `1px solid ${C.hairline}`,
        }}
      >
        {picked ? (
          <div style={{ position: "absolute", inset: 0, border: `4px solid ${C.ink}`, borderRadius: 18, opacity: p }} />
        ) : null}
        <Letter letter={l} />
        <div style={{ width: 300, flexShrink: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 21, color: C.muted }}>{feel}</div>
        </div>
        <div style={{ flex: 1, fontFamily: fam, fontWeight: w, fontSize: size, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
          {SENTENCE}
        </div>
        <div style={{ width: 210, textAlign: "right", fontSize: 23, color: C.muted, flexShrink: 0 }}>{used}</div>
        {picked ? (
          <div
            style={{
              position: "absolute",
              right: 28,
              top: -16,
              opacity: p,
              background: C.ink,
              color: C.paper,
              fontSize: 22,
              fontWeight: 600,
              padding: "5px 16px",
              borderRadius: 999,
            }}
          >
            Polecam
          </div>
        ) : null}
      </div>
    </Reveal>
  );
};

export const Decision3: React.FC = () => (
  <Frame
    step={3}
    title="Decyzja 3 z 4: Krój pisma"
    subtitle="To samo zdanie, pięć krojów. Patrz na kształt liter."
    question="Które wolisz: A, B, C, D czy E?"
    rec={{ at: PICK_AT, main: "Rekomendacja: A", sub: "General Sans wszędzie" }}
  >
    <div style={{ paddingTop: 10 }}>
      {ROWS.map((r, i) => (
        <Row key={r.l} {...r} i={i} />
      ))}
      <Reveal at={2.2}>
        <div style={{ fontSize: 25, color: C.ink, marginTop: 22, paddingLeft: 24 }}>
          Inter, Barlow, Garamond: dziś w wideo; Manrope: dziś w aplikacji.
        </div>
      </Reveal>
    </div>
  </Frame>
);
