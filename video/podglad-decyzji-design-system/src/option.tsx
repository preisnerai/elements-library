import React from "react";
import { C } from "./constants";
import { Reveal, useProgress } from "./ui";

export const Letter: React.FC<{ letter: string; size?: number }> = ({ letter, size = 56 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: C.ink,
      color: C.paper,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.55,
      fontWeight: 600,
      flexShrink: 0,
    }}
  >
    {letter}
  </div>
);

type OptionProps = {
  letter: string;
  name: string;
  delay: number;
  picked?: boolean;
  pickAt?: number;
  width?: number | string;
  note?: string;
  tiny?: string;
  children: React.ReactNode;
};

/** Kolumna wariantu: etykieta, podgląd, opis; polecany dostaje ramkę i znacznik. */
export const Option: React.FC<OptionProps> = ({
  letter,
  name,
  delay,
  picked,
  pickAt = 9,
  width,
  note,
  tiny,
  children,
}) => {
  const p = useProgress(pickAt);
  return (
    <Reveal at={delay} style={{ width, position: "relative", padding: 16 }}>
      {picked ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: `4px solid ${C.ink}`,
              borderRadius: 22,
              opacity: p,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 28,
              top: -17,
              opacity: p,
              background: C.ink,
              color: C.paper,
              fontSize: 22,
              fontWeight: 600,
              padding: "6px 16px",
              borderRadius: 999,
            }}
          >
            Polecam
          </div>
        </>
      ) : null}
      <div style={{ display: "flex", alignItems: "center", gap: 16, height: 56, marginBottom: 14 }}>
        <Letter letter={letter} />
        <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.01em" }}>{name}</div>
      </div>
      {children}
      {note ? <div style={{ fontSize: 26, marginTop: 12, color: C.ink }}>{note}</div> : null}
      {tiny ? <div style={{ fontSize: 18, marginTop: 4, color: C.muted }}>{tiny}</div> : null}
    </Reveal>
  );
};
