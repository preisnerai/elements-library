import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, EASE, FONT, FPS, REVEAL_FRAMES } from "./constants";

/** Postęp 0..1 od zadanej sekundy, 300 ms, ease-out. */
export const useProgress = (delaySec: number): number => {
  const frame = useCurrentFrame();
  const start = Math.round(delaySec * FPS);
  return interpolate(frame, [start, start + REVEAL_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
};

export const Reveal: React.FC<{
  at: number;
  rise?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, rise = 14, style, children }) => {
  const p = useProgress(at);
  return (
    <div style={{ opacity: p, translate: `0 ${(1 - p) * rise}px`, ...style }}>
      {children}
    </div>
  );
};

const Grid: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: `linear-gradient(${C.hairlineSoft} 1px, transparent 1px), linear-gradient(90deg, ${C.hairlineSoft} 1px, transparent 1px)`,
      backgroundSize: "48px 48px",
    }}
  />
);

const Mark: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: "absolute", left: x - 12, top: y - 12, width: 24, height: 24 }}>
    <div style={{ position: "absolute", left: 11, top: 0, width: 1, height: 24, background: C.hairline }} />
    <div style={{ position: "absolute", top: 11, left: 0, height: 1, width: 24, background: C.hairline }} />
  </div>
);

export type Rec = { at: number; main: string; sub?: string };

type FrameProps = {
  step: number;
  title: string;
  subtitle: string;
  question: string;
  questionSize?: number;
  rec?: Rec;
  children: React.ReactNode;
};

export const Frame: React.FC<FrameProps> = ({
  step,
  title,
  subtitle,
  question,
  questionSize = 62,
  rec,
  children,
}) => (
  <AbsoluteFill style={{ background: C.paper, fontFamily: FONT.sans, color: C.ink }}>
    <Grid />
    <Mark x={48} y={48} />
    <Mark x={1872} y={48} />
    <Mark x={48} y={1032} />
    <Mark x={1872} y={1032} />

    <div style={{ position: "absolute", left: 96, right: 96, top: 44 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted }}>
          Podgląd decyzji, system designu PreiScale
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ width: 56, height: 6, background: i <= step ? C.ink : C.hairline }} />
          ))}
        </div>
      </div>
      <Reveal at={0.3}>
        <div style={{ fontSize: 60, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 10, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, color: C.muted, marginTop: 4 }}>{subtitle}</div>
      </Reveal>
    </div>

    <div style={{ position: "absolute", left: 96, right: 96, top: 208, height: 676 }}>{children}</div>

    <div
      style={{
        position: "absolute",
        left: 96,
        right: 96,
        top: 904,
        height: 128,
        borderTop: `1px solid ${C.ink}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 40,
      }}
    >
      <Reveal at={0.6}>
        <div style={{ fontSize: questionSize, fontWeight: 600, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
          {question}
        </div>
      </Reveal>
      {rec ? (
        <Reveal at={rec.at} style={{ flexShrink: 0 }}>
          <div style={{ background: C.ink, color: C.paper, borderRadius: 20, padding: "16px 30px" }}>
            <div style={{ fontSize: 34, fontWeight: 600 }}>{rec.main}</div>
            {rec.sub ? <div style={{ fontSize: 23, opacity: 0.8, marginTop: 2 }}>{rec.sub}</div> : null}
          </div>
        </Reveal>
      ) : null}
    </div>
  </AbsoluteFill>
);
