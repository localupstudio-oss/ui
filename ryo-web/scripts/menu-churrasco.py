"""
Menu Churrasco in una pagina, nello stile del menu à la carte: stessi acquerelli (la scimmia sul ramo
dell'intestazione originale, il giaguaro, l'ananas col sigillo RYO, il ramo con i fiori rossi), la scritta
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
RED = (196, 48, 42)
OLIVE = (152, 156, 118)  # come le icone e il sigillo

INTRO = (
    "Il rito brasiliano della brace, a modo nostro: tagli scelti cotti lentamente allo spiedo "
    "e portati in tavola già impiattati, insieme a piccoli piatti da condividere."
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
    ("Picanha alla spada", "il taglio simbolo del churrasco, cotto alla spada e servito già tagliato"),
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
    # in alto a sinistra l'intestazione originale del menu: la scimmia aggrappata al ramo che entra
    # da fuori pagina tra monstere e felci, il timbro RYO e «Churrasco Menù» (senza il tucano a destra)
    page = deco(soften(p1.crop((0, 0, 392, 540)), bottom=70), (0, 0))
    mid = np.asarray(p1.crop((392, 0, 790, 474))).astype(int)
    mid[mid.mean(axis=2) > 212] = 255  # la carta leggermente grigia ai bordi non deve lasciare un filo verticale
    ramp = np.clip((np.arange(80)[::-1]) / 80, 0, 1)[None, :, None]  # le foglie in alto sfumano invece di finire di netto
    mid[:300, -80:] = 255 - (255 - mid[:300, -80:]) * ramp
    mid = Image.fromarray(mid.astype(np.uint8))
    page = deco(mid, (392, 0))
    menu = np.asarray(p1.crop((790, 380, 860, 474))).astype(int)  # la fine di «Menù», senza il ramo del tucano
    menu[menu.mean(axis=2) > 200] = 255
    menu[:16, 30:] = 255  # la punta del ramo del tucano sopra l'accento
    page = deco(Image.fromarray(menu.astype(np.uint8)), (790, 380))
    # in basso: giaguaro dell'Amazzonia a destra, ananas col sigillo RYO a sinistra
    # giaguaro tra monstere e felci (stesso acquerello delle altre pagine), un po' fuori dal bordo destro
    tiger = Image.open(ROOT / "scripts" / "menu-art" / "giaguaro.jpg").convert("RGB")
    t = np.asarray(tiger).astype(float)
    paper = np.median(t[t.mean(axis=2) > 235], axis=0)
    tiger = Image.fromarray(np.clip(t * (255 / paper), 0, 255).astype(np.uint8))  # fondo bianco puro
    tw = 440
    tiger = tiger.resize((tw, round(tiger.height * tw / tiger.width)), Image.LANCZOS)
    page = deco(soften(tiger, top=40, left=30), (W - tw + 60, H - tiger.height + 30))
    pine = soften(p4.crop((0, 1140, 410, H)), top=90, right=40)
    page = deco(pine, (0, H - round(pine.height * S)), S)


    d = ImageDraw.Draw(page)
    brush = ImageFont.truetype(str(FONTS / "CaveatBrush-Regular.ttf"), 70)
    # stesso carattere e stesse misure dei piatti del menu à la carte (nome 38, descrizione 26, nero)
    name = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Regular.ttf"), 38)
    desc = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Regular.ttf"), 26)
    body = desc
    cx = W / 2

    def centred(y, text, font, fill, x=None):
        d.text((cx if x is None else x, y), text, font=font, fill=fill, anchor="ma")

    # «Novità» in rosso, sotto «Menù» e un po' inclinato come le scritte a pennello
    nv = Image.new("RGBA", (330, 130), (0, 0, 0, 0))
    ImageDraw.Draw(nv).text((10, 10), "Novità", font=brush, fill=RED)
    nv = nv.rotate(8, resample=Image.BICUBIC, expand=True)
    page.paste(nv, (850, 372), nv)

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
    for line in wrap(d, INTRO, body, 860):
        centred(y, line, body, INK)
        y += 33
    y += 10
    for line in wrap(d, STAGIONE, desc, 780):
        centred(y, line, desc, INK)
        y += 33

    # titolo «Carnes» a pennello, preso dal menu à la carte
    y += 26
    c = np.asarray(p3.crop((100, 712, 445, 832))).astype(int)
    c[c.mean(axis=2) > 200] = 255
    carnes = Image.fromarray(c.astype(np.uint8))
    page = deco(carnes, (round(cx - carnes.width / 2), y))
    d = ImageDraw.Draw(page)
    y += carnes.height + 4
    y += original((193, 560, 536, 589), y) + 30  # «in base alle disponibilità» del vecchio menu
    col = 605  # sotto, il testo resta tra l'ananas e la pantera
    for n, info in CARNI:
        centred(y, n, name, INK, col)
        y += 46
        for line in wrap(d, info, desc, 520):
            centred(y, line, desc, INK, col)
            y += 31
        y += 16

    y += 12
    d.line((col - 60, y, col + 60, y), fill=OLIVE, width=3)
    y += 26
    y += original((588, 612, 652, 641), y, col, 1.4) + 22  # «38€» del vecchio menu
    centred(y, "a persona", desc, INK, col)
    y += 29


    page.save(OUT, quality=92)
    print("creato", OUT, "fine testo a y", y)


if __name__ == "__main__":
    main()
