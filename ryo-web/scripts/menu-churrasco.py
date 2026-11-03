"""
Menu Churrasco in una pagina, nello stile del menu à la carte: stessi acquerelli (la tigre, l'ananas
col sigillo RYO, il ramo con i fiori rossi, palme e felci), la scritta
«Churrasco Menù» e le righe del vecchio menu (degustazione, 4 tapas e 3 contorni, prezzo),
«Novità» in rosso, un'intro sul concept e la selezione di carni.

  python3 scripts/menu-churrasco.py   (scrive scripts/menu-pdf/churrasco-menu.jpg)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "scripts" / "menu-pdf"
FONTS = ROOT / "scripts" / "fonts"
OUT = PAGES / "churrasco-menu.jpg"

INK = (34, 34, 32)  # testi del menu
SOFT = (70, 70, 66)  # descrizioni
RED = (196, 48, 42)
OLIVE = (152, 156, 118)  # come le icone e il sigillo

INTRO = (
    "Il rito brasiliano della brace, a modo nostro: tagli scelti cotti lentamente allo spiedo "
    "e serviti al tavolo dal passador, accompagnati da piccoli piatti da condividere."
)
STAGIONE = (
    "Tapas e contorni cambiano con le stagioni: ogni giorno scegliamo ingredienti freschi, "
    "per portare in tavola il meglio del momento."
)
CARNI = [
    ("Salsiccia artigianale", "a punta di coltello, selezione RYO"),
    ("Pollo marinato al rosmarino", "succoso e profumato, dorato sulla brace"),
    ("Asado di maiale", "laccato con senape e miele"),
    ("Asado di manzo", "servito con chimichurri"),
    ("Picanha alla spada", "il taglio simbolo del churrasco, servito al tavolo direttamente dallo spiedo"),
]


def wrap(draw, text, font, width):
    lines, cur = [], ""
    for w in text.split():
        t = f"{cur} {w}".strip()
        if draw.textlength(t, font=font) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    return lines + [cur]


def soften(piece, top=0, bottom=0, left=0, right=0):
    """Sfuma nel bianco i lati indicati, così le decorazioni ritagliate non mostrano il taglio."""
    a = np.asarray(piece).astype(float)
    h, w = a.shape[:2]
    k = np.ones((h, w))
    for n, axis, rev in ((top, 0, False), (bottom, 0, True), (left, 1, False), (right, 1, True)):
        if not n:
            continue
        ramp = np.clip(np.arange(h if axis == 0 else w) / n, 0, 1)
        ramp = ramp[::-1] if rev else ramp
        k *= ramp[:, None] if axis == 0 else ramp[None, :]
    a = 255 - (255 - a) * k[..., None]
    return Image.fromarray(a.astype(np.uint8))


def main():
    p1 = Image.open(PAGES / "pagina-1.jpg").convert("RGB")
    p2 = Image.open(PAGES / "pagina-2.jpg").convert("RGB")
    p3 = Image.open(PAGES / "pagina-3.jpg").convert("RGB")
    p4 = Image.open(PAGES / "pagina-4.jpg").convert("RGB")
    W, H = p1.size
    page = Image.new("RGB", (W, H), "white")

    def deco(piece, at, scale=1.0):
        if scale != 1:
            piece = piece.resize((round(piece.width * scale), round(piece.height * scale)), Image.LANCZOS)
        layer = Image.new("RGB", (W, H), "white")
        layer.paste(piece, at)
        return ImageChops.multiply(page, layer)

    S = 0.8  # le decorazioni un po' più piccole della pagina Dulce, per lasciare spazio al testo
    # in alto: ramo con i fiori rossi a destra, palme a sinistra (dalla pagina dei Primi, specchiate)
    flower = soften(p4.crop((740, 0, W, 470)), bottom=90, left=60)
    page = deco(flower, (W - round(flower.width * S), 0), S)
    # in alto a sinistra: palme con il fiore arancio (pagina dei Primi) e una felce che scende
    # lungo il bordo (pagina dei Platos), fermandosi prima del titolo
    page = deco(soften(p3.crop((0, 0, 360, 235)), bottom=70, right=60), (0, 0), 1.1)
    page = deco(soften(p2.crop((0, 110, 118, 345)), top=60, bottom=80, right=25), (0, 200), 1.25)
    # in basso: tigre a destra, ananas col sigillo RYO a sinistra
    # tigre tra le monstere (stesso acquerello delle altre pagine), un po' fuori dal bordo destro
    tiger = Image.open(ROOT / "scripts" / "menu-art" / "tigre.jpg").convert("RGB")
    t = np.asarray(tiger).astype(float)
    paper = np.median(t[t.mean(axis=2) > 235], axis=0)
    tiger = Image.fromarray(np.clip(t * (255 / paper), 0, 255).astype(np.uint8))  # fondo bianco puro
    tw = 440
    tiger = tiger.resize((tw, round(tiger.height * tw / tiger.width)), Image.LANCZOS)
    page = deco(soften(tiger, top=40, left=30), (W - tw + 60, H - tiger.height + 30))
    pine = soften(p4.crop((0, 1140, 410, H)), top=90, right=40)
    page = deco(pine, (0, H - round(pine.height * S)), S)

    # «Churrasco Menù» dell'intestazione originale: solo le lettere, senza il timbro e le foglie dietro
    t = np.asarray(p1.crop((378, 322, 848, 474))).astype(int)
    lum = t.mean(axis=2)
    letters = (lum < 115) | ((t[..., 0] > 175) & (t[..., 1] < 175) & (t[..., 2] < 150) & (t[..., 0] - t[..., 2] > 60))
    t[~letters] = 255
    t[:80, 430:] = 255  # un ramo del tucano dopo la «o» di Churrasco
    title = Image.fromarray(t.astype(np.uint8))
    page = deco(title, (round(W / 2 - title.width / 2), 230))

    d = ImageDraw.Draw(page)
    brush = ImageFont.truetype(str(FONTS / "CaveatBrush-Regular.ttf"), 70)
    head = ImageFont.truetype(str(FONTS / "CaveatBrush-Regular.ttf"), 62)
    name = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Medium.ttf"), 31)
    desc = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Regular.ttf"), 23)
    body = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Regular.ttf"), 25)
    price = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Medium.ttf"), 44)
    cx = W / 2

    def centred(y, text, font, fill, x=None):
        d.text((cx if x is None else x, y), text, font=font, fill=fill, anchor="ma")

    # «Novità» in rosso, sotto «Menù» e un po' inclinato come le scritte a pennello
    nv = Image.new("RGBA", (330, 130), (0, 0, 0, 0))
    ImageDraw.Draw(nv).text((10, 10), "Novità", font=brush, fill=RED)
    nv = nv.rotate(8, resample=Image.BICUBIC, expand=True)
    page.paste(nv, (round(cx + 150), 330), nv)

    def original(box, y, x=None, scale=1.0):
        """Una riga del vecchio menu, presa così com'è: stesso carattere del grafico."""
        nonlocal page, d
        piece = p1.crop(box)
        if scale != 1:
            piece = piece.resize((round(piece.width * scale), round(piece.height * scale)), Image.LANCZOS)
        page = deco(piece, (round((cx if x is None else x) - piece.width / 2), round(y)))
        d = ImageDraw.Draw(page)
        return piece.height

    y = 470
    y += original((398, 482, 838, 524), y) + 14  # «Degustazione alla brace»
    y += original((283, 527, 955, 555), y) + 34  # «4 tapas, 3 contorni, 5 tipologie di carne alla brace»
    for line in wrap(d, INTRO, body, 820):
        centred(y, line, body, INK)
        y += 35
    y += 10
    for line in wrap(d, STAGIONE, desc, 780):
        centred(y, line, desc, SOFT)
        y += 31

    y += 40
    centred(y, "Selezione di carne", head, INK)
    y += 84
    y += original((193, 560, 536, 589), y) + 30  # «in base alle disponibilità» del vecchio menu
    col = 605  # sotto, il testo resta tra l'ananas e la pantera
    for n, info in CARNI:
        centred(y, n, name, INK, col)
        y += 40
        for line in wrap(d, info, desc, 500):
            centred(y, line, desc, SOFT, col)
            y += 29
        y += 18

    y += 12
    d.line((col - 60, y, col + 60, y), fill=OLIVE, width=3)
    y += 26
    y += original((588, 612, 652, 641), y, col, 1.4) + 22  # «38€» del vecchio menu
    centred(y, "a persona", desc, SOFT, col)
    y += 29


    page.save(OUT, quality=92)
    print("creato", OUT, "fine testo a y", y)


if __name__ == "__main__":
    main()
