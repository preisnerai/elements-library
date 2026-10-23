import S from '../../script.json';
export const C = S.colors;
export const W = 1080, H = 1920, FPS = S.fps;
// strefa bezpieczna TikTok/IG: x 80–940, y 240–1440 → środek kolumny x 510
export const SAFE = { left: 80, right: 940, top: 240, bottom: 1440, cx: 510, cy: 840 };
export const COL = { left: 110, width: 800 }; // kolumna tekstu (środek 510)
let ctx;
export const measure = (text, weight, size, tracking = 0) => {
  ctx = ctx || document.createElement('canvas').getContext('2d');
  ctx.font = `${weight} ${size}px Inter`;
  return ctx.measureText(text).width + tracking * size * Math.max(0, text.length - 1);
};
export const fit = (text, weight, max, width, tracking = 0) => { let s = max; while (s > 16 && measure(text, weight, s, tracking) > width) s -= 2; return s; };
