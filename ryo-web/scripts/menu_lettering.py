"""
Le lettere del menu à la carte, prese dalle pagine stesse (scripts/menu-pdf/pagina-*.jpg).

Il carattere del grafico non è un font pubblico: per scrivere testi nuovi identici al menu si
ritagliano le lettere da righe di cui conosciamo il testo, una per una (ogni lettera è separata
dalla successiva da almeno una colonna bianca), e si ricompongono con le stesse spaziature.
Due misure: «name» (nomi dei piatti) e «desc» (descrizioni); «caps» serve per le maiuscole
che nei nomi non compaiono (la A).
"""
from pathlib import Path

import numpy as np
from PIL import Image

PAGES = Path(__file__).resolve().parent / "menu-pdf"

# (pagina, riquadro della riga, misura, testo della riga)
LINES = [
    ("pagina-1.jpg", (285, 528, 953, 555), "desc", "4 tapas, 3 contorni, 5 tipologie di carne alla brace"),
    ("pagina-1.jpg", (194, 561, 1046, 588), "desc", "in base alle disponibilità: Picanha, maiale, manzo, pollo, vitello"),
    ("pagina-1.jpg", (115, 827, 511, 864), "name", "Croquetas di Melanzane"),
    ("pagina-1.jpg", (828, 827, 1139, 864), "name", "Polpetta di maiale"),
    ("pagina-1.jpg", (109, 872, 518, 898), "desc", "Polpetta di melanzana ripiena di"),
    ("pagina-1.jpg", (775, 872, 1191, 898), "desc", "Polpetta di maiale al vino bianco"),
    ("pagina-1.jpg", (548, 977, 778, 1004), "name", "Pollo Carioca"),
    ("pagina-1.jpg", (515, 1019, 805, 1040), "desc", "Pollo marinato e fritto"),
    ("pagina-1.jpg", (214, 1108, 412, 1143), "name", "Pan Tostado"),
    ("pagina-1.jpg", (835, 1108, 1131, 1143), "name", "Gamberi Camarao"),
    ("pagina-1.jpg", (115, 1143, 513, 1182), "name", "Tomate e Jamon Iberico"),
    ("pagina-1.jpg", (842, 1143, 1124, 1182), "desc", "Gamberi in pane panko"),
    ("pagina-1.jpg", (812, 1183, 1154, 1217), "desc", "con salsa ryo e sesamo nero"),
    ("pagina-1.jpg", (158, 1417, 468, 1450), "name", "Tortillas di Manzo"),
    ("pagina-1.jpg", (822, 1417, 1144, 1450), "name", "Empanadas di Pollo"),
    ("pagina-1.jpg", (849, 1458, 1116, 1484), "desc", "Empanadas ripiene di"),
    ("pagina-2.jpg", (158, 328, 523, 373), "name", "Cheviche di Pescato"),
    ("pagina-2.jpg", (693, 328, 1196, 373), "name", "Tagliere Salumi e Formaggi"),
    ("pagina-2.jpg", (545, 587, 695, 623), "name", "Ryo Roll"),
    ("pagina-2.jpg", (423, 661, 817, 688), "desc", "misticanza, salsa ryo e yogurt"),
    ("pagina-2.jpg", (148, 906, 533, 935), "desc", "mango e cipolla in agrodolce"),
    ("pagina-2.jpg", (553, 1050, 687, 1086), "name", "Ryo Bun"),
    ("pagina-2.jpg", (284, 1090, 955, 1118), "desc", "Bun prod. Ryo, hamburger di manzo sel. ryo da 180g,"),
    ("pagina-2.jpg", (311, 1158, 929, 1184), "desc", "isalata lollo, salsa asado. servito con patatine"),
    ("pagina-3.jpg", (358, 483, 867, 518), "name", "Pasta mista, fagioli, chorizo,"),
    ("pagina-3.jpg", (420, 525, 805, 559), "name", "jalapeno e coriandolo"),
    ("pagina-3.jpg", (157, 872, 556, 923), "name", "Bistecca selezione Ryo"),
    ("pagina-3.jpg", (146, 927, 567, 953), "desc", "Bistecca con osso da circa 800gr"),
    ("pagina-3.jpg", (807, 957, 965, 986), "name", "Maialino"),
    ("pagina-3.jpg", (221, 988, 484, 1018), "desc", "di razza e frollatura"),
    ("pagina-3.jpg", (714, 988, 1058, 1018), "desc", "Maiale di nostra selezione"),
    ("pagina-4.jpg", (532, 632, 708, 661), "caps", "BANANITO"),
]
DESCENDERS = set("gjpqy,")


class Lettering:
    def __init__(self):
        self.glyphs = {}  # (misura, lettera) -> [(alpha, alto rispetto alla linea di base)]
        self.space = {}
        self.cap = {}  # altezza delle maiuscole per misura
        pages = {}
        spaces = {}
        for page, (x0, y0, x1, y1), size, text in LINES:
            if page not in pages:
                pages[page] = np.asarray(Image.open(PAGES / page).convert("L")).astype(float)
            g = pages[page][y0:y1, x0:x1]
            ink = g < 175
            cols = ink.any(0)
            segs, x = [], 0
            while x < len(cols):
                if cols[x]:
                    s = x
                    while x < len(cols) and cols[x]:
                        x += 1
                    segs.append((s, x))
                x += 1
            chars = [c for c in text if c != " "]
            if len(segs) != len(chars):
                raise ValueError(f"{page} {text!r}: {len(segs)} pezzi per {len(chars)} lettere")
            boxes = []
            for a, b in segs:
                rows = np.where(ink[:, a:b].any(1))[0]
                boxes.append((a, b, rows.min(), rows.max() + 1))
            base = int(np.median([bt for (a, b, t, bt), c in zip(boxes, chars) if c.isalnum() and c not in DESCENDERS]))
            k = 0
            words = text.split(" ")
            for wi, word in enumerate(words):
                for j, c in enumerate(word):
                    a, b, t, bt = boxes[k]
                    alpha = np.clip((235 - g[t:bt, a:b]) / 205, 0, 1)
                    self.glyphs.setdefault((size, c), []).append((alpha, t - base))
                    if c.isupper():
                        self.cap.setdefault(size, []).append(base - t)
                    if j + 1 == len(word) and wi + 1 < len(words):
                        spaces.setdefault(size, []).append(boxes[k + 1][0] - b)
                    k += 1
        self.space = {s: float(np.median(v)) for s, v in spaces.items()}
        self.cap = {s: float(np.median(v)) for s, v in self.cap.items()}

    def glyph(self, size, c):
        """La lettera della misura richiesta; se manca, la stessa lettera di un'altra misura in scala."""
        if (size, c) in self.glyphs:
            return self._pick(self.glyphs[(size, c)]), 1.0
        for other in ("caps", "name", "desc"):
            if (other, c) in self.glyphs:
                return self._pick(self.glyphs[(other, c)]), self.cap[size] / self.cap[other]
        raise KeyError(f"lettera {c!r} non disponibile nella misura {size}")

    @staticmethod
    def _pick(samples):
        # la versione di larghezza mediana: niente lettere sbavate o tagliate
        samples = sorted(samples, key=lambda s: s[0].shape[1])
        return samples[len(samples) // 2]

    def measure(self, text, size, scale=1.0):
        w = 0.0
        for i, c in enumerate(text):
            if c == " ":
                w += self.space[size] * scale
                continue
            (alpha, _), k = self.glyph(size, c)
            w += alpha.shape[1] * k * scale + (2 * scale if i + 1 < len(text) and text[i + 1] != " " else 0)
        return w

    def draw(self, page, text, size, cx, baseline, color=(32, 32, 30), scale=1.0):
        """Scrive text centrato in cx con la linea di base a baseline. Restituisce la pagina."""
        a = np.asarray(page).astype(float)
        x = cx - self.measure(text, size, scale) / 2
        for i, c in enumerate(text):
            if c == " ":
                x += self.space[size] * scale
                continue
            (alpha, top), k = self.glyph(size, c)
            k *= scale
            if k != 1:
                h, w = alpha.shape
                img = Image.fromarray((alpha * 255).astype(np.uint8)).resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
                alpha = np.asarray(img).astype(float) / 255
            h, w = alpha.shape
            X, Y = round(x), round(baseline + top * k)
            region = a[Y:Y + h, X:X + w]
            al = alpha[: region.shape[0], : region.shape[1], None]
            region[:] = region * (1 - al) + np.array(color) * al
            x += w + (2 * scale if i + 1 < len(text) and text[i + 1] != " " else 0)
        return Image.fromarray(a.astype(np.uint8))

    def wrap(self, text, size, width, scale=1.0):
        lines, cur = [], ""
        for w in text.split():
            t = f"{cur} {w}".strip()
            if self.measure(t, size, scale) <= width:
                cur = t
            else:
                lines.append(cur)
                cur = w
        return lines + [cur]

    def balanced(self, text, size, width, scale=1.0):
        """Come wrap, ma con righe di lunghezza simile: niente parola sola sull'ultima riga."""
        best = self.wrap(text, size, width, scale)
        n = len(best)
        w = width
        while w > width * 0.55:
            lines = self.wrap(text, size, w, scale)
            if len(lines) > n:
                break
            best = lines
            w -= 10
        return best
