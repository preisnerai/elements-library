import React from "react";
import { Theme } from "../constants";

/** Mini makieta strony głównej: nawigacja, nagłówek, akapit, pigułka, karta. */
export const Hero: React.FC<{ t: Theme; width: number; height: number }> = ({ t, width, height }) => (
  <div
    style={{
      width,
      height,
      position: "relative",
      overflow: "hidden",
      borderRadius: 16,
      border: "1px solid rgba(23,23,23,0.2)",
      background: t.bg,
      backgroundImage: `linear-gradient(${t.line} 1px, transparent 1px), linear-gradient(90deg, ${t.line} 1px, transparent 1px)`,
      backgroundSize: "40px 40px",
      color: t.ink,
    }}
  >
    <div style={{ height: 34, background: t.surface, borderBottom: `1px solid ${t.line}`, display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: 5, background: t.muted, opacity: 0.35 }} />
      ))}
    </div>
    <div style={{ padding: "26px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20 }}>
        <div style={{ fontWeight: 600 }}>PreiScale</div>
        <div style={{ color: t.muted, display: "flex", gap: 28 }}>
          <span>Oferta</span>
          <span>Kontakt</span>
        </div>
      </div>
      <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.025em", marginTop: 36, width: 520 }}>
        Mniej chaosu, więcej czasu.
      </div>
      <div style={{ fontSize: 21, lineHeight: 1.4, color: t.muted, marginTop: 18, width: 470 }}>
        Porządkujemy procesy w firmie, żeby zespół mógł robić swoje.
      </div>
      <div
        style={{
          display: "inline-block",
          marginTop: 26,
          background: t.button,
          color: t.buttonText,
          fontSize: 21,
          fontWeight: 500,
          padding: "14px 32px",
          borderRadius: 999,
        }}
      >
        Umów rozmowę
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        right: 36,
        bottom: 32,
        width: 250,
        background: t.surface,
        border: `1px solid ${t.muted}33`,
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 19, fontWeight: 600 }}>Pierwsza rozmowa</div>
      <div style={{ fontSize: 16, color: t.muted, marginTop: 4 }}>20 minut, bez zobowiązań</div>
    </div>
  </div>
);
