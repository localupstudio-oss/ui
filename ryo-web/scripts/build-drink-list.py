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
INK = HexColor("#3b2f22")
TEAL = HexColor("#2f7f84")
OLIVE = HexColor("#6e5a2e")

W, H = A4
PAPER = (234, 206, 142)  # carta ocra / senape

COCKTAILS = [
    ("Hakka", "Vodka, Sake, Lychee, Cocco, Lime, Perrier.", "€ 12,00", "Tumbler basso"),
    ("Bossa Nova", "Tequila, Campari, Estratto di mango e peperone.", "€ 12,00", "Tumbler basso"),
    ("Carioca", "Woodford whisky, Lampone, Lime, Zucchero, Foam di vino rosso.", "€ 10,00", "Bicchiere coppetta"),
    ("Machu Picchu", "Pisco, Cordiale di limone, Passion fruit, Pepe rosa.", "€ 10,00", "Coppetta piccola"),
    ("La Bombonera", "Rum, Tè verde, Mate, Ananas, Agrumi, Oleo saccarum, Soda.", "€ 10,00", "Bicchiere tiki"),
    ("RYO Collins", "Vodka, Pesca, Lychee, Lime, Fermentato frutti rossi, Tonica.", "€ 12,00", None),
    ("Old Fashioned della foresta", "Diplomático Mantuano, Fava di tonka, Honey mix, Angostura.", "€ 11,00", None),
    ("Sangria Blanca", "Gin, Amaro dolce, Vino aromatizzato con frutta tropicale.", "€ 10,00", "Bicchiere calice"),
    ("Monkey Business", "Woodford Bourbon, Banana, Limone, Miele, Ginger beer.", "€ 10,00", None),
    ("Floradora", "Gin, Violetta, Maraschino, Lime, Aria di aloe vera.", "€ 11,00", "Coppa grande"),
    ("Save the Jungle", "Cachaça, Vermouth aromatizzato al tamarillo, Lime, Agave, Ginger Ale.", "€ 10,00", None),
    ("Copacabana Dark", "Rum, Vaniglia, Cocco, Caffè espresso.", "€ 11,00", "Bicchiere coppetta"),
    ("Umeshu", "Fusetti giapponese, Sake, Roku gin.", "€ 12,00", "Tumbler basso"),
    ("Samba", "Gin Mare, Cordiale pompelmo rosa e rosmarino, Olio al basilico.", "€ 11,00", None),
    ("Negroni Chill", "Campari, Cynar, Assenzio, Cedro, Zenzero.", "€ 10,00", "Tumbler basso"),
    ("Sud America-no", "Martini Riserva Bitter, Punt e Mes, Soda all'ananas.", "€ 9,00", "Tumbler basso"),
    ("Barrel Negroni", None, "€ 10,00", "Tumbler basso"),
    ("Choco Negroni", "Martini Rubino Vermouth, Bitter Fusetti cacao, Bombay, Bitter al cioccolato.", "€ 10,00", "Tumbler basso"),
    ("Barrel Boulevardier", None, "€ 12,00", "Tumbler basso"),
]
ANALCOLICI = [
    ("Jardim Botânico", "Pompelmo rosa, Basilico, Acqua frizzante.", "€ 8,00", "Tumbler alto"),
    ("Il Rito", "Infuso di tè nero, Estratto di ananas, Cannella, Lime, Foglie di menta.", "€ 8,00", "Tumbler alto"),
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
    s = Sheet(W, H, paper=PAPER)
    paint(s)
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
        s.save(f.name)
        c.drawImage(f.name, 0, 0, W, H)


def entry(c, item, cx, y, width=250):
    """Voce centrata: «Nome  prezzo» e ingredienti. y = linea di base del nome (dall'alto)."""
    name, ingredients, price, glass = item
    p = short_price(price)
    nw = pdfmetrics.stringWidth(name, "SerifBold", 19)
    pw = pdfmetrics.stringWidth(p, "SerifBold", 15)
    x0 = cx - (nw + 8 + pw) / 2
    c.setFont("SerifBold", 19)
    c.setFillColor(PURPLE)
    c.drawString(x0, H - y, name)
    c.setFont("SerifBold", 15)
    c.setFillColor(RED)
    c.drawString(x0 + nw + 8, H - y, p)
    y += 21
    if ingredients:
        c.setFont("Sans", 11.2)
        c.setFillColor(INK)
        for line in simpleSplit(ingredients, "Sans", 11.2, width):
            c.drawCentredString(cx, H - y, line)
            y += 15
    return y


SLOTS = {  # (centro x, y) per numero di voci — la fascia del fiume resta libera
    4: [(395, 150), (205, 262), (395, 478), (205, 590)],
    3: [(375, 170), (220, 300), (375, 520)],
}
RIVER_Y = {4: 390, 3: 418}


def scene_height(name, w):
    from PIL import Image as _I
    im = _I.open(PAINT / f"{name}.jpg")
    return w * im.height / im.width


def cocktail_page(c, items, mirror, scene, seed, extra=None):
    """extra = (nome, larghezza): una seconda illustrazione piccola nell'angolo in alto libero."""
    slots = [((W - x) if mirror else x, y) for x, y in SLOTS[len(items)]]
    name, sw = scene
    sh = scene_height(name, sw)

    def paint(s):
        rng = random.Random(seed)
        # il fiume attraversa la pagina tra le voci, con anse morbide
        y0 = RIVER_Y[len(items)]
        xs = [-40 + i * 113 + rng.uniform(-12, 12) for i in range(7)]
        sign = rng.choice([-1, 1])
        ys = [y0 + sign * (-1) ** i * rng.uniform(18, 32) for i in range(7)]
        if mirror:
            xs = [W - x for x in xs]
        s.river(list(zip(xs, ys)), 46, seed=seed)
        cx = 40 if mirror else W - 40
        sg = 1 if mirror else -1
        if extra:
            ename, ew = extra
            s.place(PAINT / f"{ename}.jpg", (W - ew - 14 if mirror else 14), 18, ew, flip=not mirror, fade=22)
        else:
            # un affluente che scende dall'angolo
            s.river([(cx - sg * 30, -20), (cx + sg * 8, 40), (cx - sg * 14, 90), (cx + sg * 40, 120), (cx + sg * 90, 128)], 22, seed=seed + 20)
        s.wash(H - 58, 70, seed=seed + 3)
        x = -10 if mirror else W - sw + 10
        s.place(PAINT / f"{name}.jpg", x, H - sh - 6, sw, flip=not mirror, fade=26)

    background(c, paint)
    for item, (x, y) in zip(items, slots):
        entry(c, item, x, y)


def cover(c):
    def paint(s):
        s.river([(360, -30), (440, 40), (400, 120), (470, 180), (450, 250), (540, 300), (640, 290)], 44, seed=41)
        s.place(PAINT / "farfalle.jpg", 22, 40, 150, fade=20)
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
        s.river([(-40, 120), (80, 92), (190, 135), (300, 100), (410, 130), (510, 100), (640, 120)], 34, seed=61)
        s.place(PAINT / "colibri.jpg", 14, 560, 210, flip=True, fade=22)
        s.wash(H - 58, 70, seed=63)
        s.place(PAINT / "fenicottero.jpg", W - 300, H - scene_height("fenicottero", 310) - 6, 310, fade=26)

    background(c, paint)
    x0, x1 = 92, W - 92
    c.setFont("SerifBold", 28)
    c.setFillColor(PURPLE)
    c.drawString(x0, H - 222, "Analcolici")
    y = 276
    for name, ingredients, price, glass in ANALCOLICI:
        c.setFont("SerifBold", 18)
        c.setFillColor(PURPLE)
        c.drawString(x0, H - y, name)
        c.setFont("SerifBold", 15)
        c.setFillColor(RED)
        c.drawRightString(x1, H - y, short_price(price))
        yy = y + 18
        c.setFont("Sans", 11)
        c.setFillColor(INK)
        for line in simpleSplit(ingredients, "Sans", 11, 330):
            c.drawString(x0, H - yy, line)
            yy += 15
        y = yy + 40
    c.setFont("SansLight", 8)
    c.setFillColor(INK)
    c.drawString(x0, H - (y - 14), "Prezzi in euro.")


def main():
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("RYO · Cocktails menù")
    c.setAuthor("RYO Churrascaria | Tapas | Cocktail")
    cover(c)
    c.showPage()
    groups = [COCKTAILS[0:4], COCKTAILS[4:7], COCKTAILS[7:10], COCKTAILS[10:13], COCKTAILS[13:16], COCKTAILS[16:19]]
    scenes = [("tucano", 300), ("scimmia", 300), ("giaguaro", 300), ("bradipo", 300), ("iguana", 300), ("capibara", 300)]
    extras = [None, ("farfalle", 140), None, None, ("farfalle", 130), None]
    for n, items in enumerate(groups):
        cocktail_page(c, items, n % 2 == 1, scenes[n], seed=11 + n * 5, extra=extras[n])
        c.showPage()
    analcolici(c)
    c.showPage()
    c.save()
    print("creato", OUT)


if __name__ == "__main__":
    main()
