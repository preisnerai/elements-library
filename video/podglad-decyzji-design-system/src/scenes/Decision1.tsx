import React from "react";
import { PICK_AT, THEME_A, THEME_B } from "../constants";
import { Option } from "../option";
import { Frame } from "../ui";
import { Hero } from "./Hero";

export const Decision1: React.FC = () => (
  <Frame
    step={1}
    title="Decyzja 1 z 4: Papier i atrament"
    subtitle="Kolor tła strony i kolor tekstu. Ta sama makieta, dwa warianty."
    question="Które wolisz: A czy B?"
    rec={{ at: PICK_AT, main: "Rekomendacja: A", sub: "To już jest na stronie" }}
  >
    <div style={{ display: "flex", gap: 32, justifyContent: "space-between" }}>
      <Option
        letter="A"
        name="Obecna strona"
        delay={0.9}
        picked
        width={848}
        note="Ciepła szarość, jak kartka papieru."
        tiny="tło #f4f4f2, tekst #171717, przycisk #1d1d1d"
      >
        <Hero t={THEME_A} width={816} height={450} />
      </Option>
      <Option
        letter="B"
        name="Stary wariant z błękitem"
        delay={1.2}
        width={848}
        note="Chłodny błękit, jak ekran."
        tiny="tło #eef2f8, tekst #16181d"
      >
        <Hero t={THEME_B} width={816} height={450} />
      </Option>
    </div>
  </Frame>
);
