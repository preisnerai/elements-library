#!/usr/bin/env python3
"""Kalendarz-zdzierak: kartki dni testu zrywane jedna po drugiej, na ostatniej pieczątka z sumą.
skia-python (raster CPU) → surowe klatki BGRA → ffmpeg. Użycie: render.py [props.json] [out.mp4]"""
import json, os, subprocess, sys, time
import numpy as np, skia
from PIL import Image as PILImage

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from fontsource_ttf import ttf

P = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "props.json")))
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "out", "zdzierak-skia.mp4")
W, H, FPS, DUR = P["width"], P["height"], P["fps"], P["duration"]
# jedna rodzina na całą serię: Inter, tylko Regular i Bold
TF = {"regular": skia.Typeface.MakeFromFile(ttf("inter", 400)), "bold": skia.Typeface.MakeFromFile(ttf("inter", 700))}

def hexc(h, a=1.0):
    h = h.lstrip("#"); return skia.ColorSetARGB(int(a * 255), int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
def rgb(h): h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)
COL = P["colors"]
clamp = lambda x, a=0.0, b=1.0: max(a, min(b, x))
ease_out = lambda x: 1 - (1 - x) ** 3
ease_io = lambda x: 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2

def fmt(m):
    h, mm = divmod(int(m), 60)
    return f"{h} h {mm} min" if h and mm else (f"{h} h" if h else f"{mm} min")

def font(k, size):
    f = skia.Font(TF[k], size); f.setSubpixel(True); f.setEdging(skia.Font.Edging.kAntiAlias); return f

def text(c, s, x, y, k, size, color, align="left", track=0.0):
    f = font(k, size); p = skia.Paint(AntiAlias=True, Color=color)
    adv = [f.measureText(ch) for ch in s] if track else None
    w = (sum(adv) + track * size * (len(s) - 1)) if track else f.measureText(s)
    x0 = x - w if align == "right" else x - w / 2 if align == "center" else x
    if not track: c.drawString(s, x0, y, f, p)
    else:
        for ch, a in zip(s, adv): c.drawString(ch, x0, y, f, p); x0 += a + track * size
    return w

def fit(s, k, size, maxw, track=0.0):
    while size > 10:
        f = font(k, size); w = sum(f.measureText(ch) for ch in s) + track * size * (len(s) - 1) if track else f.measureText(s)
        if w <= maxw: return size
        size -= 2
    return size

def noise_img(w, h, base, seed, low_amp=9, fine_amp=3.5, cell=48):
    rng = np.random.default_rng(seed)
    low = rng.random((h // cell + 2, w // cell + 2)).astype(np.float32)
    low = np.asarray(PILImage.fromarray((low * 255).astype(np.uint8)).resize((w, h), PILImage.BICUBIC), np.float32) / 255
    shade = (low - .5) * low_amp + rng.normal(0, fine_amp, (h, w)).astype(np.float32)
    a = np.empty((h, w, 4), np.uint8); a[..., :3] = np.clip(rgb(base)[None, None] + shade[..., None], 0, 255); a[..., 3] = 255
    return skia.Image.fromarray(a)

# ---------- geometria sceny (strefa bezpieczna: x 80–940, y 240–1440) ----------
BOARD = skia.Rect.MakeLTRB(120, 248, 900, 1424)
PX, PY, PW, PH = 150, 540, 720, 845          # kartka
BIND = skia.Rect.MakeLTRB(140, 515, 880, 562)  # listwa klejowa
CX = (BOARD.left() + BOARD.right()) / 2
import datetime
DOW = ["pon", "wt", "śr", "czw", "pt", "sob", "nd"]
_d0 = datetime.date.fromisoformat(P["startDate"])
DAYS = [{"minutes": m, "date": f'{DOW[(_d0 + datetime.timedelta(i)).weekday()]} {(_d0 + datetime.timedelta(i)).strftime("%d.%m")}'} for i, m in enumerate(P["minutes"])]
N = len(DAYS); TOTAL = sum(P["minutes"])

def render_page(i):
    s = skia.Surface(PW, PH); c = s.getCanvas(); d = DAYS[i]; last = i == N - 1
    c.drawImage(noise_img(PW, PH, COL["paper"], 100 + i, low_amp=7), 0, 0)
    sh = skia.Paint(); sh.setShader(skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(0, PH)], [hexc("#000000", 0), hexc("#000000", .06)]))
    c.drawRect(skia.Rect.MakeWH(PW, PH), sh)
    for x in range(20, PW - 10, 18): c.drawCircle(x, 30, 2.6, skia.Paint(AntiAlias=True, Color=hexc(COL["ink"], .22)))
    ink = hexc(COL["ink"]); muted = hexc(COL["ink"], .62)
    text(c, P["pageHeader"], 40, 106, "bold", 46, hexc(COL["ink"]), track=.05)
    text(c, d["date"], PW - 40, 106, "regular", 46, hexc(COL["ink"]), align="right")
    c.drawRect(skia.Rect.MakeXYWH(40, 126, PW - 80, 4), skia.Paint(Color=ink))
    if last:  # ostatni dzień: blada czerwona cyfra-znak wodny, cała kartka dla pieczątki z wynikiem
        text(c, str(i + 1), PW / 2, 640, "bold", 600, hexc(COL["red"], .13), align="center", track=-.04)
    else:
        run = sum(x["minutes"] for x in DAYS[:i + 1])
        text(c, str(i + 1), PW / 2, 512, "bold", 420, ink, align="center", track=-.04)
        c.drawRect(skia.Rect.MakeXYWH(40, 552, PW - 80, 2), skia.Paint(Color=hexc(COL["ink"], .35)))
        text(c, P["totalLabel"], PW / 2, 612, "bold", 44, ink, align="center", track=.06)
        text(c, fmt(run), PW / 2, 732, "bold", fit(fmt(run), "bold", 128, PW - 70, -.03), ink, align="center", track=-.03)
        text(c, f'{P["todayLabel"]} +{fmt(d["minutes"])}', PW / 2, 806, "regular", 52, hexc(COL["ink"], .85), align="center")
    return s.makeImageSnapshot()

def render_wall():
    s = skia.Surface(W, H); c = s.getCanvas()
    c.drawImage(noise_img(W, H, COL["wall"], 7, low_amp=10, fine_amp=2.5, cell=90), 0, 0)
    g = skia.Paint(); g.setShader(skia.GradientShader.MakeRadial(skia.Point(420, 640), 1500, [hexc("#FFFFFF", .07), hexc("#000000", 0), hexc("#000000", .45)], [0, .45, 1]))
    c.drawRect(skia.Rect.MakeWH(W, H), g)
    return s.makeImageSnapshot()

def title_lines(s, maxw):  # auto-fit: jedna linia ≥ 84 px, inaczej dwie linie
    size = fit(s, "bold", 124, maxw, -.02)
    if size >= 84 or " " not in s: return [(s, size, 478)]
    words = s.split(); best = min(range(1, len(words)), key=lambda k: abs(len(" ".join(words[:k])) - len(" ".join(words[k:]))))
    a, b = " ".join(words[:best]), " ".join(words[best:]); size = min(fit(a, "bold", 76, maxw, -.02), fit(b, "bold", 76, maxw, -.02))
    return [(a, size, 418), (b, size, 490)]

def render_board():
    s = skia.Surface(W, H); c = s.getCanvas(); c.clear(skia.ColorTRANSPARENT)
    shadow = skia.Paint(AntiAlias=True, Color=hexc("#000000", .55)); shadow.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 26))
    c.drawRRect(skia.RRect.MakeRectXY(BOARD.makeOffset(16, 34), 10, 10), shadow)
    c.save(); c.clipRRect(skia.RRect.MakeRectXY(BOARD, 10, 10), doAntiAlias=True)
    c.drawImage(noise_img(int(BOARD.width()), int(BOARD.height()), COL["board"], 3, low_amp=12, fine_amp=4), BOARD.left(), BOARD.top())
    c.restore()
    c.drawRRect(skia.RRect.MakeRectXY(BOARD, 10, 10), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=2, Color=hexc("#FFFFFF", .35)))
    c.drawCircle(CX, 290, 15, skia.Paint(AntiAlias=True, Color=hexc("#9C7B45")))
    c.drawCircle(CX, 290, 8, skia.Paint(AntiAlias=True, Color=hexc(COL["wall"])))
    ks = fit(P["boardKicker"], "bold", 52, 700, .06)
    text(c, P["boardKicker"], CX, 356, "bold", ks, hexc(COL["red"]), align="center", track=.06)
    for line, size, y in title_lines(P["boardTitle"], 700):
        text(c, line, CX, y, "bold", size, hexc(COL["ink"]), align="center", track=-.02)
    return s.makeImageSnapshot()

def render_stamp():
    """Pieczątka: kształty rysowane jako maska pokrycia, potem kolor tuszu + nierówna faktura (RGBA bez premultiplikacji)."""
    sw, sh_ = 664, 360; s = skia.Surface(sw, sh_); c = s.getCanvas(); c.clear(skia.ColorTRANSPARENT)
    white = skia.ColorWHITE; st = skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, Color=white)
    st.setStrokeWidth(10); c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(14, 14, sw - 14, sh_ - 14), 18, 18), st)
    st.setStrokeWidth(3); c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(30, 30, sw - 30, sh_ - 30), 10, 10), st)
    kick = P["stampKicker"].replace("{n}", str(N)); ks = fit(kick, "bold", 54, 580, .05)
    text(c, kick, sw / 2, 112, "bold", ks, white, align="center", track=.05)
    c.drawRect(skia.Rect.MakeXYWH(60, 140, sw - 120, 4), skia.Paint(Color=white))
    vs = fit(fmt(TOTAL), "bold", 200, 596, -.035)
    text(c, fmt(TOTAL), sw / 2, 296, "bold", vs, white, align="center", track=-.035)
    cov = s.toarray()[..., 3].astype(np.float32) / 255
    rng = np.random.default_rng(42)
    low = rng.random((sh_ // 14 + 2, sw // 14 + 2)).astype(np.float32)
    low = np.asarray(PILImage.fromarray((low * 255).astype(np.uint8)).resize((sw, sh_), PILImage.BICUBIC), np.float32) / 255
    m = np.clip(1.0 + (low - .5) * .22 - (rng.random((sh_, sw)) < .02) * .4, .5, 1)  # lekko nierówny tusz + drobne ubytki
    out = np.empty((sh_, sw, 4), np.uint8); out[..., :3] = rgb(COL["red"]); out[..., 3] = np.clip(cov * m * 255, 0, 255)
    return skia.Image.fromarray(out, alphaType=skia.kUnpremul_AlphaType)

WALL, BOARD_IMG, STAMP = render_wall(), render_board(), render_stamp()
PAGES = [render_page(i) for i in range(N)]
TM = P["timing"]; TEARS, _t, _g = [], TM["firstTear"], TM["firstGap"]
for _ in range(N - 1): TEARS.append(_t); _t += _g; _g = max(TM["minGap"], _g * TM["gapRatio"])  # przyspieszające zrywanie
T_STAMP = TEARS[-1] + TM["stampDelay"]
_gr = np.random.default_rng(5).integers(-6, 7, (H, W, 1), dtype=np.int16)  # stałe ziarno (dobrze się kompresuje)
NX, NY = 10, 12
UV = [(PW * x / NX, PH * y / NY) for y in range(NY + 1) for x in range(NX + 1)]
IDX = [k for y in range(NY) for x in range(NX) for k in (y * (NX + 1) + x, y * (NX + 1) + x + 1, (y + 1) * (NX + 1) + x, y * (NX + 1) + x + 1, (y + 1) * (NX + 1) + x + 1, (y + 1) * (NX + 1) + x)]
PEEL = .16

def page_mesh(t_rel, seed):
    """Zwraca wierzchołki kartki (współrzędne sceny) i kolory cieniowania dla czasu od początku zrywania."""
    a = ease_io(clamp(t_rel / PEEL)); tb = max(0.0, t_rel - PEEL)
    bend = a * (1 - .5 * clamp(tb / .4))
    vx = 2100 + 180 * (seed % 3); vy, g = 300 + 60 * (seed % 2), 3400; rot = -(70 + 10 * (seed % 4)) * tb
    sc = 1 + .14 * tb; cx, cy = PX + PW / 2, PY + PH / 2
    tx, ty = -vx * tb - .5 * 7000 * tb * tb, vy * tb + .5 * g * tb * tb
    ca, sa = np.cos(np.radians(rot)), np.sin(np.radians(rot))
    pts, cols = [], []
    for u, v in UV:
        w = clamp(((u / PW) * .55 + (v / PH) * .8 - .3) / 1.05) ** 1.6
        x = PX + u - bend * w * 80 + u * bend * w * .05; y = PY + v + bend * w * 60 + v * bend * w * .04
        if tb > 0:
            dx, dy = (x - cx) * sc, (y - cy) * sc
            x, y = cx + dx * ca - dy * sa + tx, cy + dx * sa + dy * ca + ty
        pts.append(skia.Point(x, y)); k = int(255 * (1 - .2 * bend * w)); cols.append(skia.ColorSetARGB(255, k, k, k))
    return pts, cols, (tx, ty, rot, sc, a, tb)

def draw_page_mesh(c, img, pts, cols):
    p = skia.Paint(AntiAlias=True); p.setShader(img.makeShader(skia.TileMode.kClamp, skia.TileMode.kClamp, skia.SamplingOptions(skia.FilterMode.kLinear)))
    c.drawVertices(skia.Vertices.MakeCopy(skia.Vertices.kTriangles_VertexMode, pts, [skia.Point(u, v) for u, v in UV], cols, IDX), p, skia.BlendMode.kModulate)

def jag_stub(c, seed):
    rng = np.random.default_rng(seed); path = skia.Path(); path.moveTo(PX + 4, 548)
    for x in np.linspace(PX + 4, PX + PW - 4, 70): path.lineTo(float(x), 566 + float(rng.random()) * 13)
    path.lineTo(PX + PW - 4, 548); path.close()
    c.drawPath(path, skia.Paint(AntiAlias=True, Color=hexc(COL["paper"])))
    c.drawPath(path, skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.2, Color=hexc(COL["ink"], .18)))

def frame(t):
    s = skia.Surface(W, H); c = s.getCanvas()
    # kamera: wejście z lekkiego zoomu, potem powolny najazd; wstrząs przy pieczątce
    zoom = 1.04 - .04 * ease_out(clamp(t / .6)) + .075 * ease_io(clamp(t / DUR))
    dt = t - T_STAMP; shake = 10 * np.exp(-dt * 13) * np.sin(dt * 75) if dt > 0 else 0
    c.translate(CX, 900 + shake); c.scale(zoom, zoom); c.translate(-CX, -900)
    c.drawImage(WALL, 0, 0, skia.SamplingOptions(skia.FilterMode.kLinear))
    swing = 1.8 * np.exp(-dt * 1.1) * np.sin(dt * 5.2) if dt > 0 else 0  # tablica kołysze się na gwoździu
    jolt = 9 * np.exp(-dt * 18) * np.sin(dt * 40) if dt > 0 else 0       # podskok po uderzeniu
    c.save(); c.translate(0, jolt); c.rotate(swing, CX, 290)
    c.drawImage(BOARD_IMG, 0, 0, skia.SamplingOptions(skia.FilterMode.kLinear))
    torn = sum(1 for ts in TEARS if t >= ts)  # kartki, które już zaczęły odchodzić
    gone = [i for i, ts in enumerate(TEARS) if t >= ts]
    top = min(torn, N - 1)
    # grubość bloczka: krawędzie pozostałych kartek
    for k in range(N - top, 0, -1):
        y = PY + PH + (k - 1) * 3
        c.drawRect(skia.Rect.MakeLTRB(PX + 2, y, PX + PW - 2, y + 3), skia.Paint(Color=hexc(COL["paper"]) if k % 2 else hexc("#D9D2C2")))
    c.drawImage(PAGES[top], PX, PY)
    if torn: jag_stub(c, 7 + torn)
    # pieczątka (na ostatniej kartce, tusz = multiply)
    if t >= T_STAMP - .1:
        k = clamp((t - (T_STAMP - .1)) / .1); sc = 1.3 - .3 * k * k
        if t > T_STAMP: sc = 1 - .03 * np.sin(clamp((t - T_STAMP) / .14) * np.pi)
        c.save(); c.translate(PX + PW / 2, PY + 520); c.rotate(-5); c.scale(sc, sc)
        sp = skia.Paint(AntiAlias=True); sp.setAlphaf(.93 * clamp(k * 1.6))
        c.drawImage(STAMP, -STAMP.width() / 2, -STAMP.height() / 2, skia.SamplingOptions(skia.FilterMode.kLinear), sp)
        c.restore()
    c.drawRect(BIND, skia.Paint(Color=hexc(COL["binding"])))
    hl = skia.Paint(); hl.setShader(skia.GradientShader.MakeLinear([skia.Point(0, BIND.top()), skia.Point(0, BIND.bottom())], [hexc("#FFFFFF", .16), hexc("#FFFFFF", 0), hexc("#000000", .3)], [0, .4, 1]))
    c.drawRect(BIND, hl)
    for sx in (PX + 150, PX + PW - 150):
        c.drawRect(skia.Rect.MakeXYWH(sx - 26, 535, 52, 7), skia.Paint(Color=hexc("#A9A9A6")))
        c.drawRect(skia.Rect.MakeXYWH(sx - 26, 535, 52, 2), skia.Paint(Color=hexc("#E8E8E4")))
    c.restore()
    # zrywane kartki (od najstarszej): cień + siatka z wygięciem
    for i in gone:
        tr = t - TEARS[i]
        if tr > 1.0: continue
        pts, cols, (tx, ty, rot, sc, a, tb) = page_mesh(tr, i)
        sp = skia.Paint(AntiAlias=True, Color=hexc("#000000", .32 * a)); sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 10 + 40 * tb))
        c.save(); c.translate(PX + PW / 2 + tx + 26 + 90 * tb, PY + PH / 2 + ty + 34 + 120 * tb); c.rotate(rot); c.scale(sc, sc)
        c.drawRect(skia.Rect.MakeXYWH(-PW / 2, -PH / 2, PW, PH), sp); c.restore()
        draw_page_mesh(c, PAGES[i], pts, cols)
    arr = s.toarray()
    arr[..., :3] = np.clip(arr[..., :3].astype(np.int16) + _gr, 0, 255).astype(np.uint8)
    return arr

if __name__ == "__main__":
    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    t0 = time.time(); n = int(round(DUR * FPS))
    ff = subprocess.Popen(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
    for f in range(n): ff.stdin.write(frame(f / FPS).tobytes())
    ff.stdin.close(); ff.wait()
    print(f"rendered {n} frames in {time.time() - t0:.1f}s -> {OUT}")
