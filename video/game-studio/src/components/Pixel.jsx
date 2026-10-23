// Pixel-art z tablicy stringów: każdy znak = piksel, '.' lub ' ' = pusty; kolory z palety.
// Łączy sąsiednie piksele w poziome odcinki (brak szwów między prostokątami).
import React from 'react';

export const runsFromGrid = (grid, palette) => {
  const out = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.' || ch === ' ' || !palette[ch]) { x++; continue; }
      let e = x; while (e + 1 < row.length && row[e + 1] === ch) e++;
      out.push({ x, y, w: e - x + 1, fill: palette[ch] }); x = e + 1;
    }
  });
  return out;
};

// <PixelGroup> rysuje w bieżącym układzie SVG (jednostka = 1); do użycia wewnątrz <svg>/<g>
export const PixelGroup = ({ grid, palette, px = 1, py = 1, x = 0, y = 0, opacity = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    {runsFromGrid(grid, palette).map((r, i) => <rect key={i} x={r.x * px} y={r.y * py} width={r.w * px + 0.02} height={py + 0.02} fill={r.fill} />)}
  </g>
);

// <PixelArt> samodzielny element HTML (absolutny), unit = px na piksel
export const PixelArt = ({ grid, palette, unit = 10, style = {}, className }) => {
  const w = Math.max(...grid.map((r) => r.length)), h = grid.length;
  return (
    <svg className={className} width={w * unit} height={h * unit} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" style={style}>
      <PixelGroup grid={grid} palette={palette} />
    </svg>
  );
};
