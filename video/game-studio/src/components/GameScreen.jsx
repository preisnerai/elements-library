// Ekran gry w pixel-arcie (siatka 40×24). Warianty: 'gray' (szkic), 'color', 'snow', 'city', 'blocks', 'merged'.
// reveal (0..1) — przejście szkic → kolor od lewej (do sceny „grafika"). t — czas (animacje: monety, bohater, śnieg, auto).
import React from 'react';

const R = (x, y, w, h, fill, k) => <rect key={k ?? `${x}-${y}-${w}-${h}-${fill}`} x={x} y={y} width={w + 0.02} height={h + 0.02} fill={fill} />;

const PAL = {
  color: { sky: ['#8ED3FF', '#A8DEFF', '#C3E9FF'], hill: '#4FA35C', grass: '#5BC46A', edge: '#3E9E4F', dirt: '#A86B3C', dot: '#8E5730', brick: '#C9824E', coin: '#F6C343', hero: '#3E7BFA', heroEye: '#FFFFFF', enemy: '#8BD15A', cloud: '#FFFFFF', pole: '#2B2B2E', flag: '#D97757' },
  gray: { sky: ['#3A3A3E', '#3E3E42', '#424246'], hill: '#4C4C51', grass: '#606065', edge: '#55555A', dirt: '#4E4E53', dot: '#47474C', brick: '#727277', coin: '#8C8C91', hero: '#9C9CA1', heroEye: '#5C5C61', enemy: '#86868B', cloud: '#56565B', pole: '#6A6A6F', flag: '#7E7E83' },
  snow: { sky: ['#BFD8EA', '#CFE2F0', '#DDEBF5'], hill: '#E9F2F8', grass: '#FFFFFF', edge: '#E3EDF4', dirt: '#CFDDE8', dot: '#BCCFDD', brick: '#9FB6C8', coin: '#F6C343', hero: '#3E7BFA', heroEye: '#FFFFFF', enemy: '#8BD15A', cloud: '#FFFFFF', pole: '#2B2B2E', flag: '#D97757' },
};

const platformer = (P, t, snow) => {
  const els = [];
  els.push(R(0, 0, 40, 8, P.sky[0], 's0'), R(0, 8, 40, 6, P.sky[1], 's1'), R(0, 14, 40, 4, P.sky[2], 's2'));
  [[4, 3], [24, 2]].forEach(([x, y], i) => { els.push(R(x + 1, y, 4, 1, P.cloud, 'c' + i + 'a'), R(x, y + 1, 6, 1, P.cloud, 'c' + i + 'b')); });
  [[0, 16, 9, 2], [2, 15, 5, 1], [26, 15, 11, 3], [28, 14, 6, 1]].forEach(([x, y, w, h], i) => els.push(R(x, y, w, h, P.hill, 'h' + i)));
  els.push(R(0, 18, 40, 1, P.grass, 'g'), R(0, 19, 40, 1, P.edge, 'ge'), R(0, 20, 40, 4, P.dirt, 'd'));
  for (let i = 0; i < 12; i++) els.push(R((i * 7 + 3) % 40, 21 + (i % 3), 1, 1, P.dot, 'dd' + i));
  els.push(R(15, 12, 7, 1, P.brick, 'pl'), R(15, 13, 7, 0.3, P.dot, 'pl2'));
  [16, 18, 20].forEach((x, i) => els.push(R(x, 10 + (Math.floor(t * 4 + i) % 2 ? -0.3 : 0), 1, 1, P.coin, 'co' + i)));
  if (snow) [[8, 13], [33, 12], [37, 14]].forEach(([x, y], i) => { els.push(R(x, y, 1, 5, '#6B4A2E', 'tr' + i), R(x - 2, y + 2, 5, 1, '#2F6B45', 'tl' + i), R(x - 1, y, 3, 2, '#2F6B45', 'tm' + i), R(x - 1, y - 0.4, 3, 0.6, '#FFFFFF', 'tc' + i), R(x - 2, y + 1.6, 5, 0.5, '#FFFFFF', 'tc2' + i)); });
  const hx = 5 + ((t * 3) % 22);
  els.push(R(hx, 15, 2, 2, P.hero, 'hb'), R(hx + 1.2, 15.5, 0.6, 0.6, P.heroEye, 'he'), R(hx, 17, 0.7, 1, P.hero, 'hl1'), R(hx + 1.3, 17, 0.7, 1, P.hero, 'hl2'));
  els.push(R(28, 16.5, 3, 1.5, P.enemy, 'en'), R(28.6, 16.8, 0.5, 0.5, '#1B1B1D', 'ee1'), R(29.9, 16.8, 0.5, 0.5, '#1B1B1D', 'ee2'));
  els.push(R(35, 11, 0.5, 7, P.pole, 'po'), R(35.5, 11, 2.5, 1.5, P.flag, 'fl'));
  if (snow) for (let i = 0; i < 46; i++) { const x = (i * 37.3) % 40, y = ((i * 13.7) % 24 + t * (2.2 + (i % 3) * 0.8)) % 24; els.push(R(x + Math.sin(t * 2 + i) * 0.4, y, 0.45, 0.45, '#FFFFFF', 'sf' + i)); }
  return els;
};

const city = (t, blocky = false) => {
  const els = [R(0, 0, 40, 10, '#9ED8F8', 'k0'), R(0, 10, 40, 10, '#B9E3FA', 'k1')];
  const bld = [[1, 8, 5, '#4B5D73'], [7, 4, 6, '#3E4E62'], [14, 10, 4, '#5E7189'], [19, 2, 6, '#46586E'], [26, 7, 5, '#5A6D84'], [32, 5, 6, '#3E4E62']];
  bld.forEach(([x, top, w, c], i) => {
    els.push(R(x, top, w, 20 - top, c, 'b' + i));
    if (blocky) for (let yy = top; yy < 20; yy += 2) for (let xx = x; xx < x + w; xx += 2) els.push(<rect key={`bo${i}-${xx}-${yy}`} x={xx} y={yy} width={2} height={2} fill="none" stroke="rgba(0,0,0,.28)" strokeWidth={0.12} />);
    for (let yy = top + 1; yy < 19; yy += 2) for (let xx = x + 1; xx < x + w - 0.5; xx += 2) if ((xx * 3 + yy * 5 + i) % 4) els.push(R(xx, yy, 0.8, 0.8, blocky ? '#7FD36B' : '#FFE08A', `w${i}-${xx}-${yy}`));
    if (blocky) els.push(R(x, top, w, 0.6, '#5BC46A', 'gt' + i));
  });
  els.push(R(0, 20, 40, 4, '#2B2B2E', 'road'));
  for (let i = 0; i < 8; i++) els.push(R(i * 5 + 1, 21.8, 2.4, 0.4, '#F2F2F2', 'rd' + i));
  const cx = -6 + ((t * 9) % 50);
  els.push(R(cx, 19.4, 5, 1.4, '#E3473E', 'car'), R(cx + 1, 18.5, 2.6, 1, '#E3473E', 'car2'), R(cx + 1.3, 18.7, 0.9, 0.6, '#BFE4FF', 'cw'), R(cx + 0.6, 20.7, 1, 0.8, '#1B1B1D', 'w1'), R(cx + 3.4, 20.7, 1, 0.8, '#1B1B1D', 'w2'));
  return els;
};

const blocks = (t, placed = 99) => {
  const els = [R(0, 0, 40, 12, '#8ED3FF', 'k0'), R(0, 12, 40, 8, '#A8DEFF', 'k1')];
  const block = (x, y, k, type = 'grass') => {
    const top = type === 'grass' ? '#5BC46A' : type === 'stone' ? '#9A9AA0' : type === 'wood' ? '#B07A45' : '#A86B3C';
    const side = type === 'grass' ? '#A86B3C' : type === 'stone' ? '#7D7D84' : type === 'wood' ? '#8E5F33' : '#8E5730';
    return [R(x, y, 2, 2, side, k + 's'), R(x, y, 2, type === 'grass' ? 0.7 : 2, top, k + 't'), <rect key={k + 'o'} x={x} y={y} width={2} height={2} fill="none" stroke="rgba(0,0,0,.3)" strokeWidth={0.12} />];
  };
  for (let x = 0; x < 40; x += 2) els.push(...block(x, 20, 'g' + x), ...block(x, 22, 'u' + x, 'dirt'));
  const build = [[10, 18, 'stone'], [12, 18, 'stone'], [14, 18, 'stone'], [16, 18, 'stone'], [10, 16, 'wood'], [16, 16, 'wood'], [10, 14, 'wood'], [16, 14, 'wood'], [10, 12, 'stone'], [12, 12, 'stone'], [14, 12, 'stone'], [16, 12, 'stone'], [12, 10, 'stone'], [14, 10, 'stone'],
    [26, 18, 'grass'], [28, 18, 'grass'], [28, 16, 'grass'], [30, 18, 'grass'], [30, 16, 'grass'], [30, 14, 'grass']];
  build.slice(0, placed).forEach(([x, y, type], i) => els.push(...block(x, y, 'b' + i, type)));
  els.push(R(13, 16, 2, 2, '#3A2A1E', 'door'));
  return els;
};

export const GameScreen = ({ variant = 'color', t = 0, w, h, reveal = null, placed = 99, style = {} }) => {
  const draw = (v) => v === 'city' ? city(t) : v === 'merged' ? city(t, true) : v === 'blocks' ? blocks(t, placed) : platformer(PAL[v] || PAL.color, t, v === 'snow');
  const id = React.useMemo(() => 'gs' + Math.random().toString(36).slice(2), []);
  return (
    <svg width={w} height={h} viewBox="0 0 40 24" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" style={{ display: 'block', ...style }}>
      {reveal == null ? draw(variant) : (<>
        {draw('gray')}
        <defs><clipPath id={id}><rect x={0} y={0} width={40 * reveal} height={24} /></clipPath></defs>
        <g clipPath={`url(#${id})`}>{draw(variant)}</g>
        {reveal > 0 && reveal < 1 && <rect x={40 * reveal - 0.25} y={0} width={0.5} height={24} fill="#FFFFFF" opacity={0.9} />}
      </>)}
    </svg>
  );
};
