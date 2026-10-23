// Narzędzia i dodatki pixel-art dla Clawda (siatki; ax/ay = punkt chwytu w pikselach siatki).
export const TOOLS = {
  wrench: { grid: ['..##', '..#.', '.#..', '#...'], palette: { '#': '#2B2B2E' }, px: 1.2, ax: 0, ay: 3, rot: -20 },
  magnifier: { grid: ['..###.', '.#...#', '.#...#', '.#...#', '..###.', '.#....', '#.....'], palette: { '#': '#1B1B1D' }, px: 0.9, ax: 0, ay: 6 },
  brush: { grid: ['....oo', '...ooo', '..oo..', '.#....', '#.....'], palette: { 'o': '#3E7BFA', '#': '#2B2B2E' }, px: 1.1, ax: 0, ay: 4 },
  roller: { grid: ['oooooo', 'oooooo', '..#...', '..#...', '..#...'], palette: { 'o': '#3E7BFA', '#': '#2B2B2E' }, px: 1.0, ax: 2, ay: 4 },
  hammer: { grid: ['####', '####', '.#..', '.#..', '.#..'], palette: { '#': '#2B2B2E' }, px: 1.1, ax: 1, ay: 4 },
  plug: { grid: ['.#.#.', '#####', '#####', '.###.', '..#..'], palette: { '#': '#1B1B1D' }, px: 0.9, ax: 2, ay: 4 },
  sword: { grid: ['......w', '.....wl', '....wl.', '...wl..', 'h.wl...', '.hh....', '.hh....', 'g..h...'], palette: { 'w': '#E9EEF3', 'l': '#9FB3C8', 'h': '#7A4A2A', 'g': '#F2C14E' }, px: 1.0, ax: 1, ay: 6 },
  flag: { grid: ['#ooo', '#ooo', '#...', '#...', '#...'], palette: { '#': '#2B2B2E', 'o': '#D97757' }, px: 1.1, ax: 0, ay: 4 },
};
export const HATS = {
  beanie: { grid: ['....bbbb....', '..bbbbbbbb..', '.bbbbbbbbbb.', 'wwwwwwwwwwww'], palette: { 'b': '#3E7BFA', 'w': '#F2F2F2' }, px: 1, dx: 3, dy: -4 },
  crown: { grid: ['g..g..g', 'ggggggg', 'ggggggg'], palette: { 'g': '#F2C14E' }, px: 1.2, dx: 4.8, dy: -3.6 },
  cap: { grid: ['...kkkkkk...', '..kkkkkkkk..', 'kkkkkkkkkkkk'], palette: { 'k': '#1B1B1D' }, px: 1, dx: 3, dy: -3 },
  headset: { grid: ['..kkkkkkkk..', '.k........k.', 'k..........k', 'k..........k'], palette: { 'k': '#1B1B1D' }, px: 1, dx: 3, dy: -2 },
};
