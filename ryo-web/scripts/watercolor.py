"""
Acquerelli procedurali per la drink list: il fiume come nastro che si attorciglia
(bordi più scuri, granulosità della carta, tratti asciutti) e la striscia d'acqua
in fondo alla pagina. Tutto disegnato da codice nei colori di RYO: nessuna immagine
presa da altri.
"""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

DPI = 150
PT = DPI / 72  # pixel per punto tipografico


def _noise(h, w, scale, seed):
    """Rumore morbido 0–1 (random sfocato) a una data scala in pixel."""
    rng = np.random.default_rng(seed)
    sh, sw = max(2, h // scale + 2), max(2, w // scale + 2)
    small = Image.fromarray((rng.random((sh, sw)) * 255).astype(np.uint8))
    big = small.resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(scale / 3))
    a = np.asarray(big, dtype=np.float32) / 255
    return (a - a.min()) / max(1e-6, a.max() - a.min())


def _catmull(pts, n=24):
    out = []
    p = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in range(2)))
    out.append(pts[-1])
    return out


class Sheet:
    """Foglio bianco su cui stendere gli acquerelli (coordinate in punti, origine in alto a sinistra)."""

    def __init__(self, w_pt, h_pt, paper=(255, 254, 251)):
        self.w, self.h = int(w_pt * PT), int(h_pt * PT)
        self.rgb = np.ones((self.h, self.w, 3), np.float32) * np.array(paper, np.float32)
        grain = _noise(self.h, self.w, 3, 7)
        self.grain = 0.82 + 0.36 * grain  # granulazione della carta

    def _lay(self, alpha, color):
        """Pigmento trasparente: moltiplica come un vero acquerello."""
        a = np.clip(alpha * self.grain, 0, 1)[..., None]
        col = np.array(color, np.float32)
        self.rgb = self.rgb * (1 - a) + (self.rgb * col / 255) * a

    def ribbon(self, pts_pt, width_pt, seed=1, twist=170, light=(150, 214, 206), dark=(48, 136, 140), strength=1.0):
        """Nastro sinuoso che si attorciglia: larghezza che pulsa, una faccia chiara e una scura."""
        rng = np.random.default_rng(seed)
        path = [(x * PT, y * PT) for x, y in _catmull([tuple(p) for p in pts_pt])]
        s = [0.0]
        for a, b in zip(path, path[1:]):
            s.append(s[-1] + math.dist(a, b))
        phase = rng.random() * math.pi
        body = Image.new("L", (self.w, self.h), 0)
        shade = Image.new("L", (self.w, self.h), 0)
        db, ds = ImageDraw.Draw(body), ImageDraw.Draw(shade)
        prev = None
        for i, ((x, y), si) in enumerate(zip(path, s)):
            j = min(i + 1, len(path) - 1)
            k = max(i - 1, 0)
            dx, dy = path[j][0] - path[k][0], path[j][1] - path[k][1]
            L = math.hypot(dx, dy) or 1
            nx, ny = -dy / L, dx / L
            tw = math.sin(si / (twist * PT) * math.pi + phase)
            w = width_pt * PT * (0.18 + 0.82 * abs(tw)) * (0.9 + 0.2 * rng.random())
            l, r = (x + nx * w / 2, y + ny * w / 2), (x - nx * w / 2, y - ny * w / 2)
            if prev:
                quad = [prev[0], l, r, prev[1]]
                db.polygon(quad, fill=255)
                ds.polygon(quad, fill=int(255 * (0.5 + 0.5 * (1 if tw > 0 else -1) * min(1, abs(tw) * 2.5))))
            prev = (l, r)
        m = np.asarray(body.filter(ImageFilter.GaussianBlur(1.6)), np.float32) / 255
        sh = np.asarray(shade.filter(ImageFilter.GaussianBlur(4)), np.float32) / 255
        inner = np.asarray(body.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.GaussianBlur(3)), np.float32) / 255
        edge = np.clip(m - inner, 0, 1)  # il pigmento si accumula ai bordi
        n1 = _noise(self.h, self.w, 60, seed + 1)
        n2 = _noise(self.h, self.w, 14, seed + 2)
        dry = np.clip((n2 - 0.06) * 5, 0, 1)  # piccoli vuoti del pennello asciutto
        a = m * (0.40 + 0.34 * n1) * dry + edge * 0.6
        color = np.array(light, np.float32)[None, None] * (1 - sh[..., None] * 0.55) + np.array(dark, np.float32)[None, None] * (sh[..., None] * 0.55)
        a = np.clip(a * strength, 0, 0.95)
        a3 = (a * self.grain)[..., None]
        self.rgb = self.rgb * (1 - a3) + (self.rgb * color / 255) * a3
        # filo sottile più scuro che corre lungo il nastro (il segno del pennello)
        line = Image.new("L", (self.w, self.h), 0)
        ImageDraw.Draw(line).line([(x + 3, y + 2) for x, y in path[:: 3]], fill=255, width=max(1, int(1.2 * PT)))
        la = np.asarray(line.filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255 * 0.25 * (n1 > 0.45)
        self._lay(la, dark)

    def wash(self, top_pt, height_pt, seed=3, colors=((126, 196, 190), (96, 160, 176), (140, 190, 150))):
        """Striscia d'acqua in basso: bordo superiore irregolare, velature orizzontali."""
        y0 = int(top_pt * PT)
        hh = int(height_pt * PT)
        rng = np.random.default_rng(seed)
        xs = np.arange(self.w)
        edge = y0 + (np.sin(xs / 90 + rng.random() * 6) * 5 + np.sin(xs / 23 + rng.random() * 6) * 2.5) * PT
        Y = np.arange(self.h)[:, None]
        band = np.clip((Y - edge[None, :]) / (6 * PT), 0, 1) * (Y < y0 + hh)
        streak = _noise(self.h, self.w, 9, seed + 5)
        streak = np.asarray(Image.fromarray((streak * 255).astype(np.uint8)).resize((self.w // 12, self.h)).resize((self.w, self.h), Image.BICUBIC), np.float32) / 255
        depth = np.clip((Y - edge[None, :]) / (hh * 0.9), 0, 1)
        tint = _noise(self.h, self.w, 140, seed + 6)
        for i, c in enumerate(colors):
            sel = np.clip(1 - np.abs(tint * 2.2 - i * 1.1), 0, 1)
            a = band * sel * (0.30 + 0.38 * streak) * (0.6 + 0.6 * depth)
            self._lay(a, c)
        # riga più scura sul pelo dell'acqua
        crest = np.exp(-(((Y - edge[None, :] - 3 * PT) / (2.4 * PT)) ** 2)) * 0.3 * (streak > 0.35)
        self._lay(crest, colors[1])

    def dab(self, cx_pt, cy_pt, rx_pt, ry_pt, color, seed=9, alpha=0.4):
        """Macchia d'acquerello (sassi, terra, riflessi)."""
        n = _noise(self.h, self.w, 18, seed)
        Y, X = np.mgrid[0: self.h, 0: self.w]
        d = ((X - cx_pt * PT) / (rx_pt * PT)) ** 2 + ((Y - cy_pt * PT) / (ry_pt * PT)) ** 2
        a = np.clip(1 - d + (n - 0.5) * 0.8, 0, 1) ** 0.6 * alpha
        self._lay(a, color)

    def save(self, path, quality=86):
        Image.fromarray(np.clip(self.rgb, 0, 255).astype(np.uint8)).save(path, quality=quality, optimize=True)
