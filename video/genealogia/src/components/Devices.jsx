// Urządzenia (ciemne obudowy) z dowolną treścią ekranu (children). x,y = lewy górny róg obudowy; s = skala.
import React from 'react';
import { C } from '../lib/theme';

export const Laptop = ({ x, y, s = 1, children, screen = '#141416', style = {} }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 460 * s, height: 320 * s, ...style }}>
    <div style={{ position: 'absolute', left: 30 * s, top: 0, width: 400 * s, height: 270 * s, borderRadius: 18 * s, background: C.card, padding: 14 * s, boxShadow: '0 30px 60px rgba(0,0,0,.25)' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 8 * s, overflow: 'hidden', background: screen }}>{children}</div>
    </div>
    <div style={{ position: 'absolute', left: 0, top: 266 * s, width: 460 * s, height: 26 * s, borderRadius: `${6 * s}px ${6 * s}px ${16 * s}px ${16 * s}px`, background: '#2A2A2D', boxShadow: '0 18px 30px rgba(0,0,0,.22)' }} />
  </div>
);
