"""
Drink list di RYO in PDF (A4), nello stile delle carte "ad acquerello" dei grandi
ristoranti: carta bianca, il fiume come nastro d'acquerello che attraversa le pagine,
una striscia d'acqua in fondo e un animale del locale per pagina. Voci sfalsate a
destra e a sinistra, nome e prezzo in serif, ingredienti in bastoni.

Testi dalla bozza del locale (Drinklist_RYO_bozza_2.pdf); logo e illustrazioni
ritagliati dalla bozza (scripts/drink-art/); acquerelli generati da scripts/watercolor.py.

  python3 scripts/build-drink-list.py [uscita.pdf]   (predefinito: public/menu/ryo-drink-list.pdf)
"""
import random
import re
import sys
import tempfile
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
from watercolor import Sheet  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "scripts" / "drink-art"
PAINT = ART / "acquerello"  # scene ad acquerello (sostituire con gli originali ad alta risoluzione, stessi nomi)
FONTS = ROOT / "scripts" / "fonts"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "public" / "menu" / "ryo-drink-list.pdf"

for name, file in [("SerifBold", "PlayfairDisplay-SemiBold"), ("Serif", "PlayfairDisplay-Regular"), ("SerifIt", "PlayfairDisplay-Italic"),
                   ("Sans", "Montserrat-Regular"), ("SansLight", "Montserrat-Light"), ("SansSemi", "Montserrat-SemiBold")]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / f"{file}.ttf")))

PURPLE = HexColor("#3d2a5a")  # viola del logo
RED = HexColor("#c8323c")
INK = HexColor("#3a3a3a")
TEAL = HexColor("#2f7f84")
OLIVE = HexColor("#8a7a52")

W, H = A4

COCKTAILS = [
    ("Hakka", "Vodka, Sake, Lychee, Cocco, Lime, Perrier.", "€ 12,00", "Tumbler basso"),
    ("Bossa nova", "Tequila, Campari, Estratto di mango e peperone.", "€ 12,00", "Tumbler basso"),
    ("Carioca", "Woodford whisky, Lampone, Lime, Zucchero, Foam di vino rosso.", "€ 10,00", "Bicchiere coppetta"),
    ("Machu Picchu", "Pisco, Cordiale di limone passion fruit pepe rosa.", "€ 10,00", "Coppetta piccola"),
    ("La Bombonera", "Rum, The verde, Mate, Ananas, Agrumi, Oleo saccarum, Soda.", "€ 10,00", "Bicchiere tiki"),
    ("Ryo collins", "Vodka, Pesca, Lychee, Lime, Fermentato frutti rossi, Tonica.", "€ 12,00", None),
    ("Old fashion della foresta", "Diplomatico Mantuano, Fava di tonka, Honey mix, Angostura.", "€ 11,00", None),
    ("Sangria Blanca", "Gin, Amaro dolce, Vino aromatizzato con frutta tropicale.", "€ 10,00", "Bicchiere calice"),
    ("Monkey business", "Woodford Bourbon, Banana, Limone, Miele, Ginger beer.", "€ 10,00", None),
    ("Floradora", "Gin, Violetta, Maraschino, Lime, Aria di aloe vera.", "€ 11,00", "Coppa grande"),
    ("Save the jungle", "Cachaca, Vermouth aromatizzato al tamarillo, Lime, Agave, Ginger Ale.", "€ 10,00", None),
    ("Copacabana dark", "Rum, Vaniglia, Cocco, Caffè espresso.", "€ 11,00", "Bicchiere coppetta"),
    ("Umeshu", "Fusetti giapponese, Sake, Roku gin.", "€ 12,00", "Tumbler basso"),
    ("Samba", "Gin mare, Cordiale pompelmo rosa e rosmarino, Olio al basilico.", "€ 11,00", None),
    ("Negron chill", "Campari, Cynar, Assenzio, Cedro, Zenzero.", "€ 10,00", "Tumbler basso"),
    ("Sud america-no", "Martini riserva bitter, Punt e mes, Soda all ananas.", "€ 9,00", "Tumbler basso"),
    ("Barrel Negroni", None, "€ 10,00", "Tumbler basso"),
    ("Choco Negroni", "Martini Rubino Vermouth, Bitter Fusetti cacao, Bombay, Bitter cioccolato", "€ 10,00", "Tumbler basso"),
    ("Barrel boulevardier", None, "€ 12,00", "Tumbler basso"),
]
ANALCOLICI = [
    ("Jardim botanico", "Pompelmo rosa, Basilico Acqua frizzante.", "€ 8,00", "Tumbler alto"),
    ("Il rito", "Infuso di the nero, Estratto di ananas, Cannella, Lime, Foglie di menta.", "€ 8,00", "Tumbler alto"),
    ("Rio 0.0", "Distillato analcolico, Cetriolo, Soda allo zenzero piccante.", "€ 9,00", "Bicchiere calice"),
]


def short_price(p):
    """«€ 12,00» → «12», «€ 9,50» → «9,5»: il prezzo accanto al nome, come nelle carte d'autore."""
    n = re.sub(r"[^\d,]", "", p)
    return n.replace(",00", "").rstrip("0") if "," in n and not n.endswith(",00") else n.replace(",00", "")


def spaced(c, text, x, y, font, size, tracking, color, anchor="center"):
    w = pdfmetrics.stringWidth(text, font, size) + tracking * (len(text) - 1)
    x0 = {"center": x - w / 2, "left": x, "right": x - w}[anchor]
    t = c.beginText(x0, y)
    t.setFont(font, size)
    t.setFillColor(color)
    t.setCharSpace(tracking)
    t.textOut(text)
    t.setCharSpace(0)
    c.drawText(t)
    return w


def image(c, name, x, y_top, w, anchor="l", flip=False):
    """Immagine con il bordo superiore a y_top (coordinate dall'alto)."""
    img = ImageReader(str(ART / f"{name}.png"))
    iw, ih = img.getSize()
    h = w * ih / iw
    if anchor == "r":
        x -= w
    elif anchor == "c":
        x -= w / 2
    c.saveState()
    if flip:
        c.translate(2 * x + w, 0)
        c.scale(-1, 1)
    c.drawImage(img, x, H - y_top - h, w, h, mask="auto")
    c.restoreState()
    return h


def background(c, paint):
    """Dipinge gli acquerelli della pagina e li mette come sfondo."""
    s = Sheet(W, H)
    paint(s)
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
        s.save(f.name)
        c.drawImage(f.name, 0, 0, W, H)


def entry(c, item, cx, y, width=215):
    """Voce centrata: «Nome  prezzo», ingredienti, bicchiere. y = linea di base del nome (dall'alto)."""
    name, ingredients, price, glass = item
    p = short_price(price)
    nw = pdfmetrics.stringWidth(name, "SerifBold", 17)
    pw = pdfmetrics.stringWidth(p, "SerifBold", 14)
    x0 = cx - (nw + 8 + pw) / 2
    c.setFont("SerifBold", 17)
    c.setFillColor(PURPLE)
    c.drawString(x0, H - y, name)
    c.setFont("SerifBold", 14)
    c.setFillColor(RED)
    c.drawString(x0 + nw + 8, H - y, p)
    y += 19
    if ingredients:
        c.setFont("Sans", 10.4)
        c.setFillColor(INK)
        for line in simpleSplit(ingredients, "Sans", 10.4, width):
            c.drawCentredString(cx, H - y, line)
            y += 14
    if glass:
        y += 2
        spaced(c, glass.upper(), cx, H - y, "SansLight", 6.8, 1.9, TEAL)
    return y


SLOTS = [(395, 150), (205, 262), (395, 478), (205, 590)]  # (centro x, y) — fascia libera 330–445 per il fiume


def scene_height(name, w):
    from PIL import Image as _I
    im = _I.open(PAINT / f"{name}.jpg")
    return w * im.height / im.width


def cocktail_page(c, items, mirror, scene, seed):
    slots = [((W - x) if mirror else x, y) for x, y in SLOTS][: len(items)]
    name, sw = scene
    sh = scene_height(name, sw)

    def paint(s):
        rng = random.Random(seed)
        # il fiume: parte dal lato della scena, attraversa la pagina tra le voci e torna giù verso l'acqua
        xs = [-20 + i * 106 + rng.uniform(-14, 14) for i in range(7)]
        sign = rng.choice([-1, 1])
        ys = [392 + sign * (-1) ** i * rng.uniform(26, 42) for i in range(7)]
        if mirror:
            xs = [W - x for x in xs]
        s.ribbon(list(zip(xs, ys)), 30, seed=seed, twist=150 + seed * 7)
        cx = 40 if mirror else W - 40
        sg = 1 if mirror else -1
        s.ribbon([(cx - sg * 50, -10), (cx + sg * 5, 30), (cx - sg * 20, 70), (cx + sg * 30, 100), (cx + sg * 70, 104)], 18, seed=seed + 20, twist=80)
        s.wash(H - 58, 70, seed=seed + 3)
        x = -10 if mirror else W - sw + 10
        s.place(PAINT / f"{name}.jpg", x, H - sh - 6, sw, flip=not mirror, fade=26)

    background(c, paint)
    for item, (x, y) in zip(items, slots):
        entry(c, item, x, y)


def cover(c):
    def paint(s):
        s.ribbon([(330, -10), (430, 40), (390, 120), (470, 170), (440, 250), (540, 300), (620, 290)], 34, seed=41, twist=130)
        s.wash(H - 70, 80, seed=43)
        s.place(PAINT / "ara.jpg", -20, 560, 300, fade=26)

    background(c, paint)
    cx = W / 2
    image(c, "logo", cx, 250, 280, anchor="c")
    spaced(c, "COCKTAILS", cx, H - 372, "SansLight", 9, 6, OLIVE)
    c.setFont("SerifIt", 30)
    c.setFillColor(RED)
    c.drawCentredString(cx, H - 406, "menù")
    lines = [
        "“Come le acque del fiume scorrono libere e travolgenti,",
        "così l'arte della mixology dà vita a cocktail",
        "che racchiudono l'anima del Rio.",
        "Un viaggio tra profumi, colori e sapori tropicali,",
        "dove ogni sorso racconta una storia.”",
    ]
    y = 448
    c.setFont("SerifIt", 11)
    c.setFillColor(OLIVE)
    for i, line in enumerate(lines):
        c.drawCentredString(cx, H - y, line)
        y += 16 + (8 if i == 2 else 0)


def analcolici(c):
    def paint(s):
        s.ribbon([(-20, 120), (80, 92), (180, 135), (290, 95), (400, 132), (500, 100), (615, 125)], 22, seed=61, twist=110)
        s.wash(H - 58, 70, seed=63)
        s.place(PAINT / "tucano.jpg", W - 300, H - scene_height("tucano", 310) - 6, 310, fade=26)

    background(c, paint)
    x0, x1 = 92, W - 92
    c.setFont("SerifBold", 24)
    c.setFillColor(PURPLE)
    c.drawString(x0, H - 220, "Analcolici")
    y = 276
    for name, ingredients, price, glass in ANALCOLICI:
        c.setFont("SerifBold", 15)
        c.setFillColor(PURPLE)
        c.drawString(x0, H - y, name)
        c.setFont("SerifBold", 13)
        c.setFillColor(RED)
        c.drawRightString(x1, H - y, short_price(price))
        yy = y + 15
        c.setFont("Sans", 9.6)
        c.setFillColor(INK)
        for line in simpleSplit(ingredients, "Sans", 9.6, 330):
            c.drawString(x0, H - yy, line)
            yy += 13
        if glass:
            spaced(c, glass.upper(), x0, H - yy - 1, "SansLight", 6.4, 1.8, TEAL, anchor="left")
        y = yy + 44
    c.setFont("SansLight", 7)
    c.setFillColor(INK)
    c.drawString(x0, H - (y - 18), "Prezzi in euro.")


def main():
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("RYO · Cocktails menù")
    c.setAuthor("RYO Churrascaria | Tapas | Cocktail")
    cover(c)
    c.showPage()
    scenes = [("tucano", 300), ("scimmia", 300), ("giaguaro", 300), ("iguana", 300), ("ara", 250)]
    for n, start in enumerate(range(0, len(COCKTAILS), 4)):
        cocktail_page(c, COCKTAILS[start:start + 4], n % 2 == 1, scenes[n], seed=11 + n * 5)
        c.showPage()
    analcolici(c)
    c.showPage()
    c.save()
    print("creato", OUT)


if __name__ == "__main__":
    main()
