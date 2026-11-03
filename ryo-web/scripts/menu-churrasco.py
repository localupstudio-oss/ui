"""
Menu Churrasco in una pagina, nello stile del menu à la carte: l'intestazione originale
(scimmia, tucano, timbro RYO, «Churrasco Menù»), la scritta «Novità» in rosso, un'intro sul
concept, tapas e antipasti di stagione, la selezione di carni e il prezzo. In basso le foglie e
il fiore arancio delle altre pagine del menu.

  python3 scripts/menu-churrasco.py   (scrive scripts/menu-pdf/churrasco-menu.jpg)
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "scripts" / "menu-pdf"
FONTS = ROOT / "scripts" / "fonts"
OUT = PAGES / "churrasco-menu.jpg"

INK = (34, 34, 32)  # testi del menu
SOFT = (70, 70, 66)  # descrizioni
RED = (196, 48, 42)
OLIVE = (152, 156, 118)  # come le icone e il timbro

INTRO = (
    "Il rito brasiliano della brace, a modo nostro: tagli scelti cotti lentamente allo spiedo "
    "e serviti al tavolo dal passador, accompagnati da piccoli piatti da condividere."
)
STAGIONE = (
    "Si comincia con 4 tapas e 3 antipasti dello chef, che cambiano con le stagioni: "
    "ogni giorno scegliamo ingredienti freschi, per portare in tavola il meglio del momento."
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


def main():
    p1 = Image.open(PAGES / "pagina-1.jpg").convert("RGB")
    p2 = Image.open(PAGES / "pagina-2.jpg").convert("RGB")
    p3 = Image.open(PAGES / "pagina-3.jpg").convert("RGB")
    W, H = p1.size
    page = Image.new("RGB", (W, H), "white")
    page.paste(p1.crop((0, 0, W, 520)), (0, 0))  # intestazione originale con «Churrasco Menù»
    page.paste(Image.new("RGB", (450, 50), "white"), (395, 470))  # via l'inizio di «Degustazione alla brace»
    fade = Image.linear_gradient("L").resize((W, 50))  # foglie e coda del tucano sfumano nel bianco
    page.paste(Image.new("RGB", (W, 50), "white"), (0, 470), fade)

    def deco(src, box, at, soft=110, side=None):
        """Decorazione presa da un'altra pagina: il bordo alto sfuma nel bianco, così non si vede il taglio."""
        piece = src.crop(box)
        white = Image.new("RGB", piece.size, "white")
        mask = Image.linear_gradient("L").rotate(180).resize((piece.width, soft))
        white.paste(piece.crop((0, soft, piece.width, piece.height)), (0, soft))
        white.paste(piece.crop((0, 0, piece.width, soft)), (0, 0), Image.eval(mask, lambda v: 255 - v))
        if side:  # anche il bordo laterale verso il testo sfuma
            sm = Image.linear_gradient("L").rotate(90 if side == "right" else -90).resize((90, piece.height))
            x = piece.width - 90 if side == "right" else 0
            white.paste(Image.new("RGB", (90, piece.height), "white"), (x, 0), sm)
        layer = Image.new("RGB", (W, H), "white")
        layer.paste(white, at)
        return ImageChops.multiply(page, layer)

    page = deco(p3, (0, 1290, 268, H), (0, 1290), side="right")  # monstera in basso a sinistra
    page = deco(p2, (930, 1360, W, H), (930, 1360), side="left")  # fiore arancio in basso a destra

    d = ImageDraw.Draw(page)
    brush = ImageFont.truetype(str(FONTS / "CaveatBrush-Regular.ttf"), 78)
    head = ImageFont.truetype(str(FONTS / "CaveatBrush-Regular.ttf"), 64)
    name = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Medium.ttf"), 33)
    desc = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Regular.ttf"), 24)
    body = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Regular.ttf"), 26)
    price = ImageFont.truetype(str(FONTS / "SpaceGrotesk-Medium.ttf"), 44)
    cx = W / 2

    def centred(y, text, font, fill):
        d.text((cx, y), text, font=font, fill=fill, anchor="ma")

    # «Novità» in rosso, inclinato come le scritte a pennello del menu
    t = Image.new("RGBA", (360, 140), (0, 0, 0, 0))
    ImageDraw.Draw(t).text((10, 10), "Novità", font=brush, fill=RED)
    t = t.rotate(10, resample=Image.BICUBIC, expand=True)
    page.paste(t, (850, 330), t)

    y = 530
    for line in wrap(d, INTRO, body, 860):
        centred(y, line, body, INK)
        y += 36

    # tapas e antipasti
    y += 40
    centred(y, "Tapas & antipasti", head, INK)
    y += 86
    for line in wrap(d, STAGIONE, desc, 820):
        centred(y, line, desc, SOFT)
        y += 32

    # carni
    y += 44
    centred(y, "Selezione di carne", head, INK)
    y += 92
    for n, info in CARNI:
        centred(y, n, name, INK)
        y += 42
        for line in wrap(d, info, desc, 560):
            centred(y, line, desc, SOFT)
            y += 30
        y += 18

    # prezzo, con il filo oliva del timbro
    y += 14
    d.line((cx - 60, y, cx + 60, y), fill=OLIVE, width=3)
    y += 26
    centred(y, "38€", price, INK)
    y += 62
    centred(y, "a persona", desc, SOFT)
    y += 30
    centred(y, "le carni possono variare in base alla disponibilità", desc, SOFT)

    page.save(OUT, quality=92)
    print("creato", OUT, "fine testo a y", y + 30)


if __name__ == "__main__":
    main()
