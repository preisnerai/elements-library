// Wspólne funkcje ruchu (wszystko liczone z czasu w sekundach, deterministycznie).
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t, start, dur) => clamp((t - start) / dur);
export const lerp = (a, b, k) => a + (b - a) * k;
export const expoOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const expoInOut = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2);
export const cubicOut = (x) => 1 - Math.pow(1 - x, 3);
export const cubicInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const backOut = (x, c = 1.8) => 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
export const pulse = (t, at, dur) => { const p = prog(t, at, dur); return p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0; };
// wejście z rozmycia (jak w referencjach): przezroczystość + blur + lekki przesuw i skala
export const blurIn = (t, at, { dur = 0.42, dist = 26, blur = 16, scale = 0.05 } = {}) => {
  const p = prog(t, at, dur), e = expoOut(p);
  return { opacity: clamp(p * 2.5), filter: `blur(${((1 - e) * blur).toFixed(2)}px)`, transform: `translateY(${((1 - e) * dist).toFixed(2)}px) scale(${1 - scale + scale * e})` };
};
export const blurOut = (t, at, { dur = 0.3, blur = 22 } = {}) => {
  const p = cubicOut(prog(t, at, dur));
  return { opacity: 1 - p, filter: `blur(${(p * blur).toFixed(2)}px)` };
};
// pop (skala z przestrzeleniem)
export const popIn = (t, at, { dur = 0.45, from = 0.4, c = 2.2 } = {}) => {
  const p = prog(t, at, dur);
  return { opacity: clamp(p * 4), transform: `scale(${p > 0 ? from + (1 - from) * backOut(p, c) : from})` };
};
export const typed = (text, t, at, cps = 22) => text.slice(0, Math.max(0, Math.floor((t - at) * cps)));
