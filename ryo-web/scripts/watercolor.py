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
            self._paint(a * 1.1, c)
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

    def place(self, path, x_pt, y_pt, w_pt, flip=False, fade=0.0, strength=1.0):
        """Incolla un acquerello su fondo bianco in modalità «moltiplica»: il bianco sparisce
        e la pittura si fonde con il fiume e l'acqua già stesi. fade = sfuma i bordi (in punti)."""
        im = Image.open(path).convert("RGB")
        if flip:
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        w = int(w_pt * PT)
        h = int(w * im.height / im.width)
        im = im.resize((w, h), Image.LANCZOS)
        a = np.asarray(im, np.float32) / 255
        # fondo della pittura → bianco puro (la carta), così non resta il rettangolo
        paper = np.percentile(a.reshape(-1, 3), 97, axis=0)
        a = np.clip(a / np.maximum(paper, 0.5) * 1.015, 0, 1)
        if fade:
            f = int(fade * PT)
            ramp = np.ones((h, w), np.float32)
            for axis, n in ((0, h), (1, w)):
                r = np.clip(np.minimum(np.arange(n), np.arange(n)[::-1]) / f, 0, 1)
                ramp *= r[:, None] if axis == 0 else r[None, :]
            a = 1 - (1 - a) * ramp[..., None]
        if strength < 1:
            a = 1 - (1 - a) * strength  # velatura più leggera
        x0, y0 = int(x_pt * PT), int(y_pt * PT)
        xa, ya = max(0, x0), max(0, y0)
        xb, yb = min(self.w, x0 + w), min(self.h, y0 + h)
        self.rgb[ya:yb, xa:xb] *= a[ya - y0: yb - y0, xa - x0: xb - x0]
        return h / PT

    def _paint(self, alpha, color):
        """Velatura coprente (per i riflessi chiari, che col «moltiplica» non si potrebbero fare)."""
        a = np.clip(alpha, 0, 1)[..., None]
        self.rgb = self.rgb * (1 - a) + np.array(color, np.float32) * a

    def river(self, pts_pt, width_pt, seed=1, water=((158, 212, 200), (96, 170, 166), (52, 122, 128)), bank=(150, 150, 90)):
        """Un fiume vero visto dall'alto: rive erbose sfumate, acqua a velature, canale più
        profondo che segue le anse, riflessi della corrente e bordi bagnati irregolari."""
        rng = np.random.default_rng(seed)
        path = [(x * PT, y * PT) for x, y in _catmull([tuple(p) for p in pts_pt], n=40)]
        s = [0.0]
        for a, b in zip(path, path[1:]):
            s.append(s[-1] + math.dist(a, b))
        L = s[-1] or 1
        ph = rng.random(3) * 6.28
        n = len(path)

        def width(i):
            t = s[i] / L
            return width_pt * PT * (0.8 + 0.24 * math.sin(t * 7 + ph[0]) + 0.1 * math.sin(t * 19 + ph[1]))

        normals, curv = [], []
        for i in range(n):
            j, k = min(i + 1, n - 1), max(i - 1, 0)
            dx, dy = path[j][0] - path[k][0], path[j][1] - path[k][1]
            l = math.hypot(dx, dy) or 1
            normals.append((-dy / l, dx / l))
        for i in range(n):
            j, k = min(i + 2, n - 1), max(i - 2, 0)
            a1 = math.atan2(*reversed(normals[k])); a2 = math.atan2(*reversed(normals[j]))
            curv.append(((a2 - a1 + math.pi) % (2 * math.pi)) - math.pi)

        def band(scale, offset_k=0.0, jitter=0.0):
            img = Image.new("L", (self.w, self.h), 0)
            d = ImageDraw.Draw(img)
            left, right = [], []
            for i, (x, y) in enumerate(path):
                w = width(i) * scale * (1 + jitter * (rng.random() - 0.5))
                off = curv[i] * offset_k * width(i)  # il canale profondo scivola verso l'esterno dell'ansa
                nx, ny = normals[i]
                cx, cy = x + nx * off, y + ny * off
                left.append((cx + nx * w / 2, cy + ny * w / 2))
                right.append((cx - nx * w / 2, cy - ny * w / 2))
            d.polygon(left + right[::-1], fill=255)
            return np.asarray(img, np.float32) / 255

        def wobble(m, amp, scale, sd):
            dx = (_noise(self.h, self.w, scale, sd) - 0.5) * amp * PT
            dy = (_noise(self.h, self.w, scale, sd + 1) - 0.5) * amp * PT
            im = Image.fromarray((m * 255).astype(np.uint8))
            arr = np.asarray(im, np.float32) / 255
            yy, xx = np.mgrid[0: self.h, 0: self.w]
            xs = np.clip((xx + dx).astype(int), 0, self.w - 1)
            ys = np.clip((yy + dy).astype(int), 0, self.h - 1)
            return arr[ys, xs]

        blur = lambda m, r: np.asarray(Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r)), np.float32) / 255
        n1 = _noise(self.h, self.w, 70, seed + 3)
        n2 = _noise(self.h, self.w, 16, seed + 4)
        # rive: ombra verde larga, poi una riva di sabbia chiara a ridosso dell'acqua
        banks = blur(wobble(band(1.6, jitter=0.25), 12, 40, seed + 5), 7 * PT)
        self._lay(banks * (0.12 + 0.14 * n1), bank)
        sand = blur(wobble(band(1.22, jitter=0.3), 6, 26, seed + 10), 1.5 * PT)
        self._paint(sand * (0.35 + 0.3 * n2), (245, 228, 186))
        # ciuffi di vegetazione lungo gli argini
        tufts = Image.new("L", (self.w, self.h), 0)
        td = ImageDraw.Draw(tufts)
        for i in range(0, n, 9):
            if rng.random() < 0.55:
                side = 1 if rng.random() < 0.5 else -1
                nx, ny = normals[i]
                r = width(i) * (0.62 + rng.random() * 0.25)
                cx, cy = path[i][0] + nx * side * r, path[i][1] + ny * side * r
                for _ in range(rng.integers(2, 6)):
                    rr = (1.5 + rng.random() * 4) * PT
                    ox, oy = (rng.random() - 0.5) * 8 * PT, (rng.random() - 0.5) * 8 * PT
                    td.ellipse([cx + ox - rr, cy + oy - rr * 0.7, cx + ox + rr, cy + oy + rr * 0.7], fill=int(150 + rng.random() * 100))
        tf = blur(np.asarray(tufts, np.float32) / 255, 1.2 * PT) * (0.6 + 0.4 * n2)
        self._lay(tf * 0.55, (96, 138, 74))
        # acqua a velature coprenti: turchese chiaro, canale più intenso, bordi bagnati
        body = blur(wobble(band(1.0, jitter=0.08), 4, 22, seed + 6), 1.2)
        inner = blur(np.asarray(Image.fromarray((body * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(11)), np.float32) / 255, 3)
        edge = np.clip(body - inner, 0, 1)
        self._paint(body * (0.72 + 0.2 * n1), water[0])
        deep = blur(wobble(band(0.55, offset_k=0.9, jitter=0.3), 6, 30, seed + 7), 5 * PT)
        self._paint(deep * (0.30 + 0.25 * n2) * body, water[1])
        core = blur(wobble(band(0.2, offset_k=1.1, jitter=0.5), 6, 30, seed + 8), 4 * PT)
        self._paint(core * 0.22 * body, water[2])
        self._paint(edge * (0.35 + 0.35 * n2), water[2])
        # luce sull'acqua: macchie chiare irregolari, non linee
        glint = blur(np.clip((n2 - 0.6) * 4, 0, 1) * inner, 2.5 * PT)
        self._paint(glint * 0.45, (232, 245, 238))
        # granulazione del pigmento
        self._lay(body * 0.06 * (_noise(self.h, self.w, 5, seed + 9) > 0.6), water[2])
