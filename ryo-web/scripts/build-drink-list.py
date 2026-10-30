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
    ("Barrel Negroni", "Ricetta segreta", "€ 12,00", "Tumbler basso"),
    ("Choco Negroni", "Martini Rubino Vermouth, Bitter Fusetti cacao, Bombay, Bitter al cioccolato.", "€ 10,00", "Tumbler basso"),
    ("Barrel Boulevardier", "Ricetta segreta", "€ 12,00", "Tumbler basso"),
]
SOFT_DRINK = ("5", ["Perrier acqua frizzante", "Soda all'ananas", "Soda al pompelmo rosa", "Soda al limone", "Tonica Indian", "Ginger beer", "Coca-Cola", "Coca-Cola Zero", "Tassoni"])
BIRRE = [("Nastro Azzurro", "5"), ("Corona", "5"), ("Birra artigianale rossa", "7"), ("Birra artigianale bionda", "7")]
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
    fs = 19
    while fs > 14 and pdfmetrics.stringWidth(name, "SerifBold", fs) + 8 + pdfmetrics.stringWidth(p, "SerifBold", 15) > width + 30:
        fs -= 0.5
    nw = pdfmetrics.stringWidth(name, "SerifBold", fs)
    pw = pdfmetrics.stringWidth(p, "SerifBold", 15)
    x0 = cx - (nw + 8 + pw) / 2
    c.setFont("SerifBold", fs)
    c.setFillColor(PURPLE)
    c.drawString(x0, H - y, name)
    c.setFont("SerifBold", 15)
    c.setFillColor(RED)
    c.drawString(x0 + nw + 8, H - y, p)
    y += 21
    if ingredients:
        c.setFont("Sans", 11.2)
        c.setFillColor(INK)
        if ingredients == "Ricetta segreta":
            c.setFont("SerifIt", 13)
            c.setFillColor(OLIVE)
            c.drawCentredString(cx, H - y, ingredients)
            return y + 15
        for line in simpleSplit(ingredients, "Sans", 11.2, width):
            c.drawCentredString(cx, H - y, line)
            y += 15
    return y


SLOTS = {  # (centro x, y) per numero di voci — la fascia del fiume resta libera
    4: [(395, 150), (205, 262), (395, 478), (205, 590)],
    3: [(375, 170), (220, 300), (375, 520)],
    5: [(395, 100), (205, 196), (395, 398), (205, 494), (395, 590)],
}
RIVER_Y = {4: 390, 3: 418, 5: 312}


def scene_height(name, w):
    from PIL import Image as _I
    im = _I.open(PAINT / f"{name}.jpg")
    return w * im.height / im.width


def img_h(name, w):
    return scene_height(name, w)


def river_line(s, p0, p1, width=170, strength=0.8):
    """Fiume reale ad acquerello lungo la retta p0 → p1 (anche obliqua), fatto di tratti raccordati."""
    import math
    (x0, y0), (x1, y1) = p0, p1
    L = math.hypot(x1 - x0, y1 - y0)
    seg = img_h("fiume-verticale", width) * 0.9
    n = max(1, math.ceil(L / seg))
    ang = math.degrees(math.atan2(x1 - x0, y1 - y0))  # 0 = verticale verso il basso
    for i in range(n):
        t = (i + 0.5) / n
        s.place_rotated(PAINT / "fiume-verticale.jpg", x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, width, ang,
                        flip=i % 2 == 1, fade=18, strength=strength)


def jungle_frame(s, mirror, seed, scene=None, top_border=True, river=True, side=False):
    """Paesaggio: piante negli angoli in alto e sui lati, fiume reale che attraversa la pagina
    in obliquo fino all'acqua in basso, animale sulla riva in un angolo in basso."""
    X = (lambda x: W - x) if mirror else (lambda x: x)
    bw = W + 60
    bh = img_h("fiume-orizzontale", bw)
    by = H - bh * 0.5  # in basso solo l'acqua e la riva
    if river and side:  # pagine-elenco e copertina: il fiume scende lungo il bordo
        river_line(s, (X(W - 95), -40), (X(W - 140), H - 150), width=165)
    elif river:
        # scende quasi dritto a destra, poi piega in obliquo verso l'acqua in basso a sinistra
        pts = [(430, -40), (430, 280), (190, 520), (150, 735)]
        for a, b in zip(pts, pts[1:]):
            river_line(s, (X(a[0]), a[1]), (X(b[0]), b[1]), width=140)
    s.place(PAINT / "fiume-orizzontale.jpg", -30, by, bw, flip=mirror, fade=10, strength=0.7)
    if top_border:
        gw = 112
        s.place(PAINT / "giungla-lato.jpg", -8, -8, gw, fade=26, strength=0.9)
        s.place(PAINT / "giungla-lato.jpg", W - gw + 8, -8, gw, flip=True, fade=26, strength=0.9)
        # ciuffi più piccoli a metà dei lati
        s.place(PAINT / "giungla-lato.jpg", (W - 80 if mirror else -14), 330, 92, flip=mirror, fade=24, strength=0.8)
    if scene:
        name, sw = scene
        sh = img_h(name, sw)
        # dal lato opposto a dove il fiume raggiunge l'acqua
        left = (not mirror) if side else mirror
        s.place(PAINT / f"{name}.jpg", (6 if left else W - sw - 6), H - sh - 10, sw, flip=not left, fade=24)


SPOTS = [(200, 112, 200), (192, 222, 190), (168, 336, 180), (450, 474, 190), (436, 586, 200)]  # (centro x, y, larghezza)


def cocktail_page(c, items, mirror, scene, seed, extra=None):
    """Voci sparse negli spazi liberi ai due lati del fiume obliquo."""

    def paint(s):
        jungle_frame(s, mirror, seed, scene=scene)

    background(c, paint)
    spots = SPOTS if len(items) == 5 else [SPOTS[0], SPOTS[2], SPOTS[3], SPOTS[4]]
    for item, (x, y, w) in zip(items, spots):
        entry(c, item, (W - x) if mirror else x, y, width=w)


def cover(c):
    def paint(s):
        jungle_frame(s, False, 41, side=True)
        s.place(PAINT / "ara.jpg", 10, 470, 300, fade=26)

    background(c, paint)
    cx = 250
    image(c, "logo", cx, 250, 270, anchor="c")
    spaced(c, "COCKTAILS", cx, H - 368, "SansLight", 10, 7, OLIVE)
    c.setFont("SerifIt", 36)
    c.setFillColor(RED)
    c.drawCentredString(cx, H - 408, "menù")


def intro(c):
    """Seconda pagina: il racconto del fiume, come la citazione d'apertura delle grandi carte."""
    def paint(s):
        jungle_frame(s, True, 51, scene=("bradipo", 240), top_border=False, side=True)
        s.place(PAINT / "farfalle.jpg", W - 170, 30, 140, fade=20)

    background(c, paint)
    cx = 345
    lines = [
        "“Come le acque del fiume",
        "scorrono libere e travolgenti,",
        "così l'arte della mixology",
        "dà vita a cocktail che racchiudono",
        "l'anima del Rio.",
        None,
        "Un viaggio tra profumi, colori",
        "e sapori tropicali, dove ogni sorso",
        "racconta una storia.”",
    ]
    y = 200
    for line in lines:
        if line is None:
            y += 18
            continue
        c.setFont("SerifIt", 17)
        c.setFillColor(PURPLE)
        c.drawCentredString(cx, H - y, line)
        y += 26
    spaced(c, "RYO  ·  CHURRASCARIA  |  TAPAS  |  COCKTAIL", cx, H - (y + 30), "SansLight", 8, 3, OLIVE)


def analcolici(c):
    def paint(s):
        jungle_frame(s, True, 61, scene=("fenicottero", 240), top_border=False, side=True)
        s.place(PAINT / "colibri.jpg", W - 175, 24, 150, fade=18)

    background(c, paint)
    x0, x1 = 228, W - 58
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
        for line in simpleSplit(ingredients, "Sans", 11, x1 - x0 - 30):
            c.drawString(x0, H - yy, line)
            yy += 15
        y = yy + 40
    c.setFont("SansLight", 8)
    c.setFillColor(INK)
    c.drawString(x0, H - (y - 14), "Prezzi in euro.")


def list_title(c, x0, x1, y, title, price=None):
    c.setFont("SerifBold", 28)
    c.setFillColor(PURPLE)
    c.drawString(x0, H - y, title)
    if price:
        c.setFont("SerifBold", 20)
        c.setFillColor(RED)
        c.drawRightString(x1, H - y, price)


def soft_e_birre(c):
    def paint(s):
        jungle_frame(s, False, 71, top_border=False, side=True)
        s.place(PAINT / "iguana.jpg", 20, 22, 170, flip=True, fade=20)

    background(c, paint)
    x0, x1 = 60, W - 232
    price, names = SOFT_DRINK
    list_title(c, x0, x1, 205, "Soft drink", price)
    y = 238
    c.setFont("Sans", 12.5)
    c.setFillColor(INK)
    for name in names:
        c.drawString(x0, H - y, name)
        y += 20
    list_title(c, x0, x1, y + 26, "Birre")
    y += 62
    for name, p in BIRRE:
        c.setFont("SerifBold", 16)
        c.setFillColor(PURPLE)
        c.drawString(x0, H - y, name)
        c.setFont("SerifBold", 15)
        c.setFillColor(RED)
        c.drawRightString(x1, H - y, p)
        y += 27


def main():
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("RYO · Cocktails menù")
    c.setAuthor("RYO Churrascaria | Tapas | Cocktail")
    cover(c)
    c.showPage()
    intro(c)
    c.showPage()
    # 5 cocktail per pagina; l'ultima raccoglie la famiglia Negroni
    groups = [COCKTAILS[0:5], COCKTAILS[5:10], COCKTAILS[10:14], COCKTAILS[14:19]]
    scenes = [("tucano", 220), ("scimmia", 220), ("giaguaro", 220), ("capibara", 220)]
    extras = [("farfalle", 130), None, ("farfalle", 120), None]
    for n, items in enumerate(groups):
        cocktail_page(c, items, n % 2 == 1, scenes[n], seed=11 + n * 5, extra=extras[n])
        c.showPage()
    analcolici(c)
    c.showPage()
    soft_e_birre(c)
    c.showPage()
    c.save()
    print("creato", OUT)


if __name__ == "__main__":
    main()
