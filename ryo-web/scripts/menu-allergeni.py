"""
Pagina «Allergeni» del menu, come il retro della carta stampata: fondo nero, titolo a pennello,
icone in cerchi dorati e testi crema su tre colonne.

Le icone (scripts/menu-allergeni/*.png) sono ingrandite dalla foto della carta: qui se ne ricava
il simbolo e lo si ridisegna pulito dentro un cerchio perfetto.

  python3 scripts/menu-allergeni.py   (scrive scripts/menu-pdf/allergeni.jpg)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "scripts" / "menu-allergeni"
FONTS = ROOT / "scripts" / "fonts"
OUT = ROOT / "scripts" / "menu-pdf" / "allergeni.jpg"

W, H = 1240, 1754  # come le altre pagine del menu (A4 a 150 dpi)
BG = (20, 20, 18)
CREAM = (241, 234, 214)
GOLD = (214, 196, 156)
GLYPH = (30, 26, 20)

# (icona, titolo, nota): tre colonne, la frutta a guscio occupa due colonne
ROWS = [
    [("crostacei", "Crostacei e prodotti derivati", None), ("arachidi", "Arachidi e prodotti derivati", None),
     ("uova", "Uova e prodotti derivati", None)],
    [("soia", "Soia e prodotti derivati", None), ("senape", "Senape e prodotti derivati", None),
     ("sedano", "Sedano e prodotti derivati", None)],
    [("molluschi", "Molluschi e prodotti derivati", None), ("latte", "Latte e prodotti derivati, incluso lattosio", None),
     ("sesamo", "Semi di sesamo e prodotti derivati", None)],
    [("frutta", "Frutta a guscio",
      "cioè mandorle (Amygdalus communis L.), nocciole (Corylus avellana), noci comuni (Juglans regia), "
      "noci di anacardi (Anacardium occidentale), noci di pecan (Carya illinoinensis (Wangenh.) K. Koch), "
      "noci del Brasile (Bertholletia excelsa), pistacchi (Pistacia vera), noci del Queensland "
      "(Macadamia ternifolia) e prodotti derivati"),
     None,
     ("pesce", "Pesce e prodotti derivati", "tranne: gelatina o colla di pesce utilizzata come chiarificante nella birra e nel vino")],
    [("lupini", "Lupini e prodotti derivati", None),
     ("solfiti", "Anidride solforosa e solfiti", "in concentrazioni superiori a 10 mg/kg o 10 mg/l espressi come SO₂"),
     ("glutine", "Cereali contenenti glutine", "(cioè grano, segale, orzo, avena, farro, kamut o i loro ceppi ibridati) e prodotti derivati")],
]


def clean_icon(name, d):
    """Dal ritaglio ingrandito: cerchio chiaro → cerchio perfetto, tratti scuri → simbolo."""
    a = np.asarray(Image.open(ICONS / f"{name}.png").convert("L")).astype(float)
    light = a > (a.max() * 0.55)
    ys, xs = np.nonzero(light)
    cy, cx = ys.mean(), xs.mean()
    r = np.sqrt(light.sum() / np.pi) * 1.02
    yy, xx = np.mgrid[: a.shape[0], : a.shape[1]]
    inside = (yy - cy) ** 2 + (xx - cx) ** 2 < (r * 0.9) ** 2
    paper = np.median(a[light & inside])
    ink = np.clip((paper - a) / (paper * 0.55), 0, 1) * inside  # quanto è scuro il tratto
    ink_img = Image.fromarray((ink * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    ink = np.asarray(ink_img).astype(float) / 255
    ink = np.clip((ink - 0.25) / 0.45, 0, 1)  # bordi netti ma morbidi
    box = (int(cx - r), int(cy - r), int(cx + r), int(cy + r))
    glyph = Image.fromarray((ink * 255).astype(np.uint8)).crop(box).resize((d, d), Image.LANCZOS)
    S = 4  # cerchio disegnato più grande e poi ridotto, per un bordo liscio
    circ = Image.new("L", (d * S, d * S), 0)
    ImageDraw.Draw(circ).ellipse((0, 0, d * S - 1, d * S - 1), fill=255)
    circ = circ.resize((d, d), Image.LANCZOS)
    icon = Image.new("RGBA", (d, d), GOLD + (0,))
    icon.putalpha(circ)
    dark = Image.new("RGBA", (d, d), GLYPH + (255,))
    icon.paste(dark, (0, 0), glyph)
    return icon


def wrap(draw, text, font, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = f"{cur} {w}".strip()
        if draw.textlength(t, font=font) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    return lines + [cur]


def main():
    page = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(page)
    title = ImageFont.truetype(str(FONTS / "CaveatBrush-Regular.ttf"), 150)
    label = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Medium.ttf"), 25)
    note = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Regular.ttf"), 22)

    # titolo leggermente inclinato, come sulla carta
    t = Image.new("RGBA", (700, 260), (0, 0, 0, 0))
    ImageDraw.Draw(t).text((20, 20), "Allergeni", font=title, fill=CREAM)
    t = t.rotate(9, resample=Image.BICUBIC, expand=True)
    page.paste(t, (90, 110), t)

    cols = [118, 478, 838]
    col_w = 300
    d = 68
    y = 440
    for row in ROWS:
        bottom = y
        for i, cell in enumerate(row):
            if cell is None:
                continue
            name, text, extra = cell
            x = cols[i]
            width = 660 if name == "frutta" else col_w  # la frutta a guscio prende due colonne
            icon = clean_icon(name, d)
            page.paste(icon, (x, y), icon)
            ty = y + d + 22
            for line in wrap(draw, text.upper(), label, width):
                draw.text((x, ty), line, font=label, fill=CREAM)
                ty += 30
            if extra:
                ty += 14
                for line in wrap(draw, extra, note, width):
                    draw.text((x, ty), line, font=note, fill=CREAM)
                    ty += 27
            bottom = max(bottom, ty)
        y = bottom + 40

    page.save(OUT, quality=92)
    print("creato", OUT, "fine contenuto a y", y)


if __name__ == "__main__":
    main()
