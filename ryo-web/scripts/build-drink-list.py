"""
Drink list di RYO in PDF (A4), nello stile delle carte "ad acquerello" dei grandi
ristoranti: ogni pagina è un unico paesaggio dipinto (fiume, felci negli angoli,
animale in un angolo in basso) e le voci stanno sparse sulla carta rimasta libera.
Nome e prezzo in serif, ingredienti in bastoni.

Testi dalla bozza del locale (Drinklist_RYO_bozza_2.pdf); logo e illustrazioni
ritagliati dalla bozza (scripts/drink-art/); paesaggi in scripts/drink-art/acquerello/pagina-*.jpg.

  python3 scripts/build-drink-list.py [uscita.pdf]   (predefinito: public/menu/ryo-drink-list.pdf)
"""
import re
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

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

COCKTAILS = [
    ("Hakka", "Vodka Grey Goose, Sake, Lychee, Cocco, Lime, Perrier.", "€ 12,00", "Tumbler basso"),
    ("Bossa Nova", "Tequila Patrón, Martini Riserva Bitter, Estratto di mango e peperone.", "€ 12,00", "Tumbler basso"),
    ("Carioca", "Dewar's 12, Lampone, Lime, Zucchero, Foam di vino rosso.", "€ 10,00", "Bicchiere coppetta"),
    ("Machu Picchu", "Pisco, Cordiale di limone, Passion fruit, Pepe rosa.", "€ 10,00", "Coppetta piccola"),
    ("La Bombonera", "Rum Diplomático, Tè verde, Mate, Ananas, Agrumi, Oleo saccarum, Soda.", "€ 10,00", "Bicchiere tiki"),
    ("RYO Collins", "Vodka Grey Goose, Pesca, Lychee, Lime, Fermentato frutti rossi, Tonica.", "€ 12,00", None),
    ("Old Fashioned della foresta", "Diplomático Mantuano, Fava di tonka, Honey mix, Angostura.", "€ 11,00", None),
    ("Sangria Blanca", "Fords Gin, Amaro dolce, Vino aromatizzato con frutta tropicale.", "€ 10,00", "Bicchiere calice"),
    ("Monkey Business", "Woodford Bourbon, Banana, Limone, Miele, Ginger beer.", "€ 10,00", None),
    ("Floradora", "Gin Mare, Violetta, Maraschino, Lime, Aria di aloe vera.", "€ 11,00", "Coppa grande"),
    ("Save the Jungle", "Cachaça Leblon, Martini Riserva Rubino aromatizzato al tamarillo, Lime, Agave, Ginger Ale.", "€ 10,00", None),
    ("Copacabana Dark", "Rum Santa Teresa, Vaniglia, Cocco, Caffè espresso, Liquore al caffè.", "€ 11,00", "Bicchiere coppetta"),
    ("Umeshu", "Fusetti giapponese, Sake, Roku gin.", "€ 12,00", "Tumbler basso"),
    ("Samba", "Gin Mare, Cordiale pompelmo rosa e rosmarino, Olio al basilico.", "€ 11,00", None),
    ("Negroni Chill", "Martini Riserva Bitter, Cynar, Assenzio, Cedro, Zenzero.", "€ 10,00", "Tumbler basso"),
    ("Sud America-no", "Martini Riserva Bitter, Punt e Mes, Soda all'ananas.", "€ 9,00", "Tumbler basso"),
    ("Barrel Negroni", "Ricetta segreta", "€ 12,00", "Tumbler basso"),
    ("Choco Negroni", "Martini Riserva Rubino, Bitter Fusetti cacao, Bombay, Bitter al cioccolato.", "€ 10,00", "Tumbler basso"),
    ("Barrel Boulevardier", "Ricetta segreta", "€ 12,00", "Tumbler basso"),
]
SOFT_DRINK = ("5", ["Perrier acqua frizzante", "Soda all'ananas", "Soda al pompelmo rosa", "Soda al limone", "Tonica Indian", "Ginger beer", "Coca-Cola", "Coca-Cola Zero", "Tassoni"])
ACQUA = [("Acqua naturale", "2"), ("Acqua frizzante", "2")]
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


def scene(c, name, mirror=False):
    """Paesaggio a tutta pagina: largo quanto il foglio, tagliato in alto, così l'animale resta nell'angolo in basso."""
    img = ImageReader(str(PAINT / f"pagina-{name}.jpg"))
    iw, ih = img.getSize()
    h = W * ih / iw
    c.saveState()
    if mirror:
        c.translate(W, 0)
        c.scale(-1, 1)
    c.drawImage(img, 0, 0, W, h)
    c.restoreState()


def entry(c, item, cx, y, width=250, k=1.0):
    """Voce centrata: «Nome  prezzo» e ingredienti. y = linea di base del nome (dall'alto).
    k ingrandisce tutta la voce: le pagine con meno drink usano caratteri più grandi per riempire la carta."""
    name, ingredients, price, glass = item
    p = short_price(price)
    fs, ps, inf, lh = 19 * k, 15 * k, 11.2 * k, 15 * k
    while fs > 14 * k and pdfmetrics.stringWidth(name, "SerifBold", fs) + 8 + pdfmetrics.stringWidth(p, "SerifBold", ps) > width + 30:
        fs -= 0.5
    nw = pdfmetrics.stringWidth(name, "SerifBold", fs)
    pw = pdfmetrics.stringWidth(p, "SerifBold", ps)
    x0 = cx - (nw + 8 + pw) / 2
    c.setFont("SerifBold", fs)
    c.setFillColor(PURPLE)
    c.drawString(x0, H - y, name)
    c.setFont("SerifBold", ps)
    c.setFillColor(RED)
    c.drawString(x0 + nw + 8, H - y, p)
    y += 21 * k
    if ingredients:
        c.setFont("Sans", inf)
        c.setFillColor(INK)
        if ingredients == "Ricetta segreta":
            c.setFont("SerifIt", 13 * k)
            c.setFillColor(OLIVE)
            c.drawCentredString(cx, H - y, ingredients)
            return y + lh
        for line in simpleSplit(ingredients, "Sans", inf, width):
            c.drawCentredString(cx, H - y, line)
            y += lh
    return y


# Per ogni paesaggio: dove cade la carta libera (centro x della colonna, larghezza, y delle 5 voci)
# Per ogni paesaggio le 4 voci, sfalsate una a destra e una a sinistra: (centro x, y, larghezza)
COCKTAIL_PAGES = [
    ("iguana", True, [(334, 140, 200), (406, 255, 200), (270, 387, 200), (342, 502, 200)]),
    ("tucano", False, [(194, 85, 200), (266, 193, 200), (194, 301, 200), (266, 406, 200)]),
    ("scimmia", False, [(342, 70, 200), (414, 167, 200), (326, 281, 200), (398, 404, 196)]),
    ("giaguaro", False, [(202, 100, 225), (274, 236, 225), (154, 407, 225)]),
    ("capibara", False, [(358, 100, 200), (430, 215, 200), (338, 312, 200), (410, 444, 200)]),
]
ANALCOLICI_PAGE = ("fenicottero", False, [(300, 235, 225), (372, 353, 225), (288, 491, 225)])


def by_name(*names):
    return [next(x for x in COCKTAILS if x[0] == n) for n in names]


# 4 per pagina; l'ultima raccoglie i Negroni
COCKTAIL_GROUPS = [COCKTAILS[0:4], COCKTAILS[4:8], COCKTAILS[8:12], by_name("Umeshu", "Samba", "Sud America-no"),
                   by_name("Negroni Chill", "Barrel Negroni", "Choco Negroni", "Barrel Boulevardier")]
PAGE_TITLES = [None, None, None, None, None]


def staggered_page(c, items, layout, title=None):
    name, mirror, spots = layout
    k = 1.18 if len(items) >= 4 else 1.36  # caratteri più grandi; con 3 voci ancora di più, per non lasciare carta vuota
    scene(c, name, mirror)
    if title:
        text, tx, ty = title if isinstance(title, tuple) else (title, W / 2, 120)
        c.setFont("SerifBold", 28)
        c.setFillColor(PURPLE)
        c.drawCentredString(tx, H - ty, text)
    for item, (x, y, w) in zip(items, spots):
        entry(c, item, x, y, width=w, k=k)


def cover(c):
    scene(c, "ara")  # ara in volo sul fiume, logo al centro della carta libera
    cx = W / 2
    image(c, "logo", cx, 150, 260, anchor="c")
    spaced(c, "COCKTAILS", cx, H - 276, "Sans", 17, 9, OLIVE)
    c.setFont("SerifIt", 36)
    c.setFillColor(RED)
    c.drawCentredString(cx, H - 322, "menù")
    partner_logos(c)


LOGHI = ART / "loghi"  # loghi ufficiali dei marchi partner (PNG trasparenti): diplomatico, martini, gin-mare
PARTNER = ["diplomatico", "martini", "gin-mare"]


def partner_logos(c):
    """In fondo alla copertina, su una fascia di carta: «In collaborazione con» e i loghi dei partner.
    I loghi vanno messi in scripts/drink-art/loghi/ con questi nomi; finché mancano la fascia non compare."""
    files = [LOGHI / f"{n}.png" for n in PARTNER if (LOGHI / f"{n}.png").exists()]
    if not files:
        return
    band_h, y0 = 92, 22  # dal fondo della pagina
    c.saveState()
    c.setFillColorRGB(0.96, 0.92, 0.82, alpha=0.88)
    c.roundRect(60, y0, W - 120, band_h, 10, stroke=0, fill=1)
    c.restoreState()
    spaced(c, "IN COLLABORAZIONE CON", W / 2, y0 + band_h - 18, "SansLight", 7, 3, OLIVE)
    slot_w, max_h = (W - 160) / len(files), 44
    for i, f in enumerate(files):
        img = ImageReader(str(f))
        iw, ih = img.getSize()
        h = min(max_h, (slot_w - 30) * ih / iw)
        w = h * iw / ih
        x = 80 + slot_w * i + (slot_w - w) / 2
        c.drawImage(img, x, y0 + 14 + (max_h - h) / 2, w, h, mask="auto")


def analcolici(c):
    staggered_page(c, ANALCOLICI, ANALCOLICI_PAGE, title=("Analcolici", 318, 172))


def list_title(c, x0, y, title, price=None):
    c.setFont("SerifBold", 28)
    c.setFillColor(PURPLE)
    c.drawString(x0, H - y, title)
    if price:  # prezzo unico della sezione, subito dopo il titolo
        c.setFont("SerifBold", 20)
        c.setFillColor(RED)
        c.drawString(x0 + pdfmetrics.stringWidth(title, "SerifBold", 28) + 12, H - y, price)


def soft_e_birre(c):
    scene(c, "iguana")  # fiume a destra, iguana sul sasso in basso a sinistra
    x0 = 150
    price, names = SOFT_DRINK
    list_title(c, x0, 128, "Soft drink")
    y = 166
    for name, p in [(n, price) for n in names] + ACQUA:
        drink_line(c, x0, y, name, p)
        y += 23
    list_title(c, x0, y + 24, "Birre")
    y += 62
    for name, p in BIRRE:
        drink_line(c, x0, y, name, p)
        y += 23


def drink_line(c, x0, y, name, p):
    """Una riga dell'elenco con lo stesso carattere dei cocktail: nome in serif viola, prezzo rosso accanto."""
    c.setFont("SerifBold", 19)
    c.setFillColor(PURPLE)
    c.drawString(x0, H - y, name)
    c.setFont("SerifBold", 17)
    c.setFillColor(RED)
    c.drawString(x0 + pdfmetrics.stringWidth(name, "SerifBold", 19) + 9, H - y, p)


def main():
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("RYO · Cocktails menù")
    c.setAuthor("RYO Churrascaria | Tapas | Cocktail")
    cover(c)
    c.showPage()
    # 4 cocktail per pagina, sfalsati; l'ultima pagina chiude con i Negroni
    for items, layout, title in zip(COCKTAIL_GROUPS, COCKTAIL_PAGES, PAGE_TITLES):
        staggered_page(c, items, layout, title=title)
        c.showPage()
    analcolici(c)
    c.showPage()
    soft_e_birre(c)
    c.showPage()
    c.save()
    print("creato", OUT)


if __name__ == "__main__":
    main()
