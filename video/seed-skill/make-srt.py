#!/usr/bin/env python3
"""Generuje napisy SRT z script.json (czasy scen = podział lektora). Użycie: python3 make-srt.py [out.srt]"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'script.json')))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..', 'out', 'game-studio', 'game-studio.srt')
ts = lambda s: f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d},{int(round((s % 1) * 1000)) % 1000:03d}"
t, lines = 0.0, []
for i, sc in enumerate(S['scenes'], 1):
    lines += [str(i), f"{ts(t)} --> {ts(t + sc['dur'])}", sc['say'], '']
    t += sc['dur']
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w').write('\n'.join(lines))
print(out, f'({t:.1f} s)')
