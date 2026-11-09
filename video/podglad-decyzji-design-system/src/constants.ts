import { Easing } from "remotion";

export const FPS = 30;
export const W = 1920;
export const H = 1080;

/** Kolory samej prezentacji (papier kreślarski, bez akcentu). */
export const C = {
  paper: "#f4f4f2",
  surface: "#fcfcfb",
  ink: "#171717",
  muted: "#565656",
  hairline: "rgba(23,23,23,0.16)",
  hairlineSoft: "rgba(23,23,23,0.06)",
} as const;

export type Theme = {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  button: string;
  buttonText: string;
  line: string;
};

/** A: obecna strona. */
export const THEME_A: Theme = {
  bg: "#f4f4f2",
  surface: "#fcfcfb",
  ink: "#171717",
  muted: "#565656",
  button: "#1d1d1d",
  buttonText: "#f4f4f2",
  line: "rgba(23,23,23,0.07)",
};

/** B: stary wariant z błękitem (muted i przycisk dobrane pomocniczo). */
export const THEME_B: Theme = {
  bg: "#eef2f8",
  surface: "#ffffff",
  ink: "#16181d",
  muted: "#5b6472",
  button: "#16181d",
  buttonText: "#eef2f8",
  line: "rgba(22,24,29,0.07)",
};

export const VIDEO_DARK = "#111111";
export const ACCENT = { amber: "#ffaa00", yellow: "#FFD60A" } as const;
export const DARKS = {
  A: "#111111",
  B: "#030304",
  C: "#0b0b0d",
  D: "#121317",
} as const;

export const FONT = { sans: "'General Sans', sans-serif" } as const;

export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
/** 9 klatek przy 30 fps = 300 ms. */
export const REVEAL_FRAMES = 9;
export const TRANSITION_FRAMES = 9;

/** Czas rekomendacji w każdej scenie (sekundy od startu sceny). */
export const PICK_AT = 9;

export const SCENE_SEC = { d1: 17, d2: 18, d3: 17, d4: 16, sum: 15 } as const;
export const TOTAL_FRAMES =
  Object.values(SCENE_SEC).reduce((a, b) => a + b, 0) * FPS -
  4 * TRANSITION_FRAMES;
