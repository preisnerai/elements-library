"""Diagram procesu rysowany „markerem" na czarnym (styl referencji „Claude Code explained").
Manim CE (Cairo, wektorowo). Wszystko sterowane z props.json (ścieżka w zmiennej PROPS)."""
import json, os
import numpy as np
from manim import *

P = json.load(open(os.environ.get("PROPS", os.path.join(os.path.dirname(__file__), "props.json"))))
C = P["colors"]
config.pixel_width, config.pixel_height, config.frame_rate = 1080, 1920, P["fps"]
config.frame_width, config.frame_height = 9, 16          # 1 jednostka = 120 px
config.background_color = C["bg"]
FS = 1 / 1.67                                            # font_size Manim ≈ px CSS × FS
SW = 1 / 1.2                                             # stroke_width ≈ px × SW
CX = -0.25                                               # środek strefy bezpiecznej (x 80–940 px)

def ink(px): return px * SW
def label(text, px, color=C["line"], bold=False):
    return Text(text, font="Inter", weight=BOLD if bold else NORMAL, font_size=px * FS, color=color)

def rough(points, seed, amp=0.022, n=None):
    """Odręczna kreska: zagęszczona ścieżka + gładki szum prostopadły."""
    pts = np.array(points, dtype=float)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1); L = seg.sum()
    n = n or max(12, int(L * 22))
    s = np.concatenate([[0], np.cumsum(seg)]); u = np.linspace(0, L, n)
    out = np.stack([np.interp(u, s, pts[:, k]) for k in range(3)], axis=1)
    rng = np.random.default_rng(seed); ph = rng.uniform(0, 6.28, 3); fr = rng.uniform(1.2, 3.2, 3)
    w = sum(np.sin(u * fr[i] + ph[i]) for i in range(3)) / 3 * amp
    d = np.gradient(out, axis=0); nrm = np.stack([-d[:, 1], d[:, 0], 0 * d[:, 0]], axis=1)
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-9
    m = VMobject(); m.set_points_smoothly(out + nrm * w[:, None]); return m

def stroke(m, color=C["line"], px=11):
    m.set_stroke(color, ink(px)).set_fill(opacity=0); m.set_cap_style(CapStyleType.ROUND); return m
def double(make, seed, color=C["line"], px=11):
    """Dwa przeciągnięcia markerem: główne + delikatny „cień" kreski."""
    a, b = stroke(make(seed), color, px), stroke(make(seed + 101), color, px * 0.45).set_stroke(opacity=0.3)
    return VGroup(a, b)

def bez(p0, p1, bend):
    p0, p1 = np.array(p0, float), np.array(p1, float); mid = (p0 + p1) / 2
    d = p1 - p0; nrm = np.array([-d[1], d[0], 0]); nrm /= np.linalg.norm(nrm) + 1e-9
    c = mid + nrm * bend
    return [(1 - t) ** 2 * p0 + 2 * (1 - t) * t * c + t ** 2 * p1 for t in np.linspace(0, 1, 24)]

def arrow(p0, p1, seed, bend=0.0, color=C["line"]):
    pts = bez(p0, p1, bend); body = double(lambda s: rough(pts, s), seed, color)
    tip, prev = np.array(pts[-1]), np.array(pts[-3]); d = (tip - prev) / np.linalg.norm(tip - prev)
    heads = VGroup(*[stroke(rough([tip, tip - 0.36 * (np.cos(a) * d + np.sin(a) * np.array([-d[1], d[0], 0]))], seed + k, amp=0.01), color)
                     for k, a in enumerate((0.55, -0.55))])
    return VGroup(body, heads), pts

def rough_box(c, w, h, seed, color=C["line"]):
    x0, x1, y0, y1, o = c[0] - w / 2, c[0] + w / 2, c[1] - h / 2, c[1] + h / 2, 0.1   # krawędzie lekko „przestrzelone"
    sides = [[(x0 - o, y1, 0), (x1 + o * 0.6, y1 + 0.02, 0)], [(x1, y1 + o, 0), (x1 - 0.02, y0 - o * 0.7, 0)],
             [(x1 + o * 0.5, y0, 0), (x0 - o, y0 - 0.02, 0)], [(x0, y0 - o * 0.6, 0), (x0 + 0.02, y1 + o, 0)]]
    return VGroup(*[stroke(rough(s, seed + i, amp=0.015), color) for i, s in enumerate(sides)])

def rough_loop(c, rx, ry, seed, color=C["accent"]):
    rng = np.random.default_rng(seed); a0 = rng.uniform(2.0, 2.6)
    th = np.linspace(a0, a0 + 2 * np.pi + 0.45, 90)         # pętla z zakładką jak ręcznie zakreślona
    r = 1 + 0.035 * np.sin(th * 2 + 1) + np.linspace(0, 0.06, th.size)
    pts = [(c[0] + rx * r[i] * np.cos(t), c[1] + ry * r[i] * np.sin(t), 0) for i, t in enumerate(th)]
    return VGroup(stroke(rough(pts, seed, amp=0.012), color, 12), stroke(rough(pts, seed + 5, amp=0.03), color, 5).set_stroke(opacity=0.35))

def icon(kind, c, s, seed):
    x, y = c[0], c[1]; L = lambda pts, k: stroke(rough(pts, seed + k, amp=0.012))
    if kind == "mail":
        return VGroup(rough_box(c, 1.1 * s, 0.75 * s, seed), L([(x - .55 * s, y + .33 * s, 0), (x, y - .08 * s, 0), (x + .55 * s, y + .33 * s, 0)], 9))
    if kind == "calendar":
        return VGroup(rough_box(c, 1.0 * s, 0.85 * s, seed), L([(x - .5 * s, y + .17 * s, 0), (x + .5 * s, y + .17 * s, 0)], 7),
                      L([(x - .22 * s, y + .55 * s, 0), (x - .22 * s, y + .3 * s, 0)], 8), L([(x + .22 * s, y + .55 * s, 0), (x + .22 * s, y + .3 * s, 0)], 9),
                      *[Dot((x + dx * s, y + dy * s, 0), radius=0.035, color=C["line"]) for dx in (-.25, 0, .25) for dy in (-.05, -.25)])
    if kind == "list":
        return VGroup(*[L([(x - .15 * s, y + dy * s, 0), (x + .5 * s, y + dy * s, 0)], i) for i, dy in enumerate((.3, 0, -.3))],
                      *[L([(x - .5 * s, y + dy * s, 0), (x - .4 * s, y + (dy - .08) * s, 0), (x - .28 * s, y + (dy + .1) * s, 0)], 5 + i) for i, dy in enumerate((.3, 0, -.3))])
    if kind == "bubble":  # dymek odpowiedzi
        b = rough_box((x, y + .08 * s, 0), 1.1 * s, .7 * s, seed)
        tail = L([(x - .3 * s, y - .27 * s, 0), (x - .42 * s, y - .5 * s, 0), (x - .08 * s, y - .27 * s, 0)], 6)
        dots = VGroup(*[Dot((x + dx * s, y + .08 * s, 0), radius=0.05, color=C["line"]) for dx in (-.25, 0, .25)])
        return VGroup(b, tail, dots)
    if kind == "reply":
        pts = [(x + .5 * s, y - .3 * s, 0)] + [(x + .5 * s - .9 * s * (1 - np.cos(t)) / 2 * 0 + .5 * s * np.cos(t) - .5 * s, y - .3 * s + .5 * s * np.sin(t), 0) for t in np.linspace(0, np.pi / 2, 8)]
        body = L([(x + .5 * s, y - .35 * s, 0), (x + .45 * s, y + .05 * s, 0), (x + .1 * s, y + .22 * s, 0), (x - .45 * s, y + .22 * s, 0)], 1)
        head = VGroup(L([(x - .45 * s, y + .22 * s, 0), (x - .2 * s, y + .45 * s, 0)], 2), L([(x - .45 * s, y + .22 * s, 0), (x - .2 * s, y - .01 * s, 0)], 3))
        return VGroup(body, head)
    return rough_box(c, s, s, seed)

def check(c, seed):
    x, y = c[0], c[1]
    return stroke(rough([(x - .2, y + .02, 0), (x - .05, y - .16, 0), (x + .27, y + .25, 0)], seed, amp=0.01), C["accent"], 12)

class Draw(Create):
    """Create bez „kropek" z okrągłych końcówek: niezaczęte podkreski są niewidoczne."""
    def interpolate_submobject(self, submobject, starting_submobject, alpha):
        super().interpolate_submobject(submobject, starting_submobject, alpha)
        submobject.set_stroke(opacity=starting_submobject.get_stroke_opacity() if alpha > 0.004 else 0, family=False)

def pop_text(m, run_time=0.45):
    """Litery wchodzą skalą (czyściej niż Write, bez konturów)."""
    return LaggedStart(*[FadeIn(ch, scale=0.6) for ch in m], lag_ratio=0.5 / max(1, len(m)) * 3, run_time=run_time)

def show(m, run_time=0.25):
    """Słowo wchodzi w całości (bez półprzezroczystych liter)."""
    return FadeIn(m, scale=0.85, run_time=run_time, rate_func=rate_functions.ease_out_back)

def cross(c, seed, color=C["accent"]):
    x, y = c[0], c[1]
    return VGroup(stroke(rough([(x - .22, y + .22, 0), (x + .22, y - .22, 0)], seed, amp=.01), color, 13),
                  stroke(rough([(x + .22, y + .22, 0), (x - .22, y - .22, 0)], seed + 1, amp=.01), color, 13))

class Diagram(MovingCameraScene):
    def construct(self):
        cam = self.camera.frame; clock = ValueTracker(0)
        clock.add_updater(lambda m, dt: m.increment_value(dt)); self.add(clock)
        cam.add_updater(lambda m: m.set(width=9 * (1 - 0.03 * min(1, clock.get_value() / P["duration"]))))
        Y = lambda py: (960 - py) / 120; X = lambda px: (px - 540) / 120
        W = C["line"]; R = C["accent"]; ease = rate_functions.ease_out_cubic

        # rdzeń: duże słowo + biały owal (czerwień zarezerwowana dla puenty i wyjątku)
        core_c = (CX, Y(640), 0)
        core_t = label(P["core"], 132, bold=True); core_t.scale_to_fit_width(min(core_t.width, 5.4)).move_to(core_c)
        loop = rough_loop(core_c, core_t.width / 2 + 0.85, 1.25, 41, color=W)
        # wejście: ikona + podpis w jednym wierszu
        inp_t = label(P["input"]["label"], 72, bold=True)
        inp_i = icon(P["input"]["icon"], (0, 0, 0), 0.95, 11)
        row = VGroup(inp_i, inp_t).arrange(RIGHT, buff=0.28).move_to((CX, Y(318), 0))
        a1, a1p = arrow((CX, Y(392), 0), (CX, Y(466), 0), 21, 0.04)
        # wyjścia: same podpisy (Bold, biały), znaczniki pod spodem
        n = len(P["outputs"]); xs = [X(px) for px in np.linspace(205, 815, n)] if n > 1 else [CX]
        outs, outs_p, labels, marks, notes, rings = [], [], [], [], [], []
        for i, (o, x) in enumerate(zip(P["outputs"], xs)):
            a, pts = arrow((CX + (x - CX) * 0.45, Y(812), 0), (x, Y(892), 0), 50 + i * 7, bend=0.15 * np.sign(CX - x))
            outs.append(a); outs_p.append(pts)
            labels.append(label(o["label"], 62, bold=True).move_to((x, Y(948), 0)))
            marks.append(check((x, Y(1036), 0), 90 + i).set_stroke(W) if o.get("ok", True) else cross((x, Y(1036), 0), 95 + i))
            if not o.get("ok", True):
                notes.append(label(o.get("note", ""), 48, R, bold=True).move_to((x, Y(1100), 0)))
                rings.append(i)
        k = min(1, min(2.2 / lb.width for lb in labels))
        for lb in labels: lb.scale(k)
        rings = [rough_loop(labels[i].get_center(), labels[i].width / 2 + 0.22, 0.42, 61 + i, color=R) for i in rings]
        top = label(P["resultTop"], 96, bold=True).move_to((CX, Y(1214), 0))
        num, rest = P["resultBig"].split(" ", 1)                     # liczba osobno → miejsce na zakreślenie
        big = VGroup(label(num, 124, R, bold=True), label(rest, 124, R, bold=True)).arrange(RIGHT, buff=0.55, aligned_edge=DOWN)
        big.scale_to_fit_width(min(big.width, 6.6)).move_to((CX, Y(1326), 0))
        under = stroke(rough([(big.get_left()[0] - 0.1, Y(1398), 0), (big.get_right()[0] + 0.15, Y(1392), 0)], 99, amp=0.025), R, 12)
        zero = big[0]; zring = rough_loop(zero.get_center(), zero.width / 2 + 0.28, zero.height / 2 + 0.3, 77, color=R)

        # pakiet z ogonem: mail → agent → kolejne gałęzie (sekwencyjnie)
        def pm(pts): m = VMobject(); m.set_points_smoothly(pts); return m
        p_in, p_outs = pm(a1p), [pm(p) for p in outs_p]
        legs = [p_in] + p_outs; leg_t = 0.32
        def packet(start, period):
            g = VGroup(*[Dot(radius=0.15 * (1 - j * 0.18), color=R) for j in range(5)])
            def upd(gr):
                tt = (clock.get_value() - start) % period
                for j, d in enumerate(gr):
                    u = tt - j * 0.035; leg = int(u // leg_t) if u >= 0 else -1; q = (u % leg_t) / leg_t if u >= 0 else 0
                    if 0 <= leg < len(legs): d.move_to(legs[leg].point_from_proportion(min(0.85, q * 0.85))).set_opacity((1 - j * 0.2) * np.sin(np.pi * min(1, q * 1.05)))
                    else: d.set_opacity(0)
            g.add_updater(upd); return g

        self.play(show(core_t, 0.3), Draw(loop, run_time=0.45, rate_func=rate_functions.ease_in_out_sine), lag_ratio=0.3)
        self.play(show(row, 0.25), Draw(a1, run_time=0.3, rate_func=ease), lag_ratio=0.4)
        self.play(LaggedStart(*[AnimationGroup(Draw(a, rate_func=ease), show(lb)) for a, lb in zip(outs, labels)], lag_ratio=0.22, run_time=0.6))
        t0 = clock.get_value(); self.add(packet(t0, 10.0))
        self.wait(leg_t)                                                    # mail → agent
        for i in range(n):                                                   # gałąź po gałęzi: znacznik po dotarciu pakietu
            anims = [Draw(marks[i], run_time=0.22, rate_func=ease)]
            if not P["outputs"][i].get("ok", True):
                j = sum(1 for o in P["outputs"][:i] if not o.get("ok", True))
                anims += [Draw(rings[j], run_time=0.3), show(notes[j], 0.25)]
            self.wait(max(0, t0 + leg_t * (i + 2) - 0.05 - clock.get_value()))
            self.play(*anims)
        self.play(show(top, 0.28)); self.play(show(big, 0.3), Draw(under, run_time=0.4, rate_func=ease))
        self.add(packet(clock.get_value() + 0.4, 1.9))                       # system dalej pracuje
        self.wait(max(0, 4.35 - clock.get_value()))
        self.play(Draw(zring, run_time=0.45, rate_func=rate_functions.ease_in_out_sine))   # drugi beat: zakreślone „0"
        self.wait(max(0.0, P["duration"] - self.renderer.time))
