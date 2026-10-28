"""
Drink list di RYO in PDF (A4), impaginata in stile "carta da grande ristorante": carta crema,
cornice sottile oro, nomi in maiuscoletto spaziato, ingredienti in corsivo, illustrazioni del
locale come vignette e il fiume turchese che scorre lungo il bordo.

Testi identici alla bozza del locale (Drinklist_RYO_bozza_2.pdf); logo e illustrazioni sono
ritagliati dalla bozza (scripts/drink-art/).

  python3 scripts/build-drink-list.py   →  public/menu/ryo-drink-list.pdf
"""
import math
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "scripts" / "drink-art"
FONTS = ROOT / "scripts" / "fonts"
import sys
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "public" / "menu" / "ryo-drink-list.pdf"

for name, file in [("Serif", "PlayfairDisplay-Regular"), ("SerifMed", "PlayfairDisplay-Medium"), ("SerifIt", "PlayfairDisplay-Italic"),
                   ("Sans", "Montserrat-Regular"), ("SansLight", "Montserrat-Light"), ("SansMed", "Montserrat-Medium"), ("SansSemi", "Montserrat-SemiBold")]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / f"{file}.ttf")))

# Colori del locale (dalla bozza): crema, viola del logo, rosso, turchese del fiume, oro
PAPER = HexColor("#f4ecd3")
PURPLE = HexColor("#4a2d6b")
RED = HexColor("#cf2f3a")
GOLD = HexColor("#b8955a")
TEAL = HexColor("#5dbb9f")
TEAL_LIGHT = HexColor("#93d7c0")
PEACH = HexColor("#f1d3b3")

W, H = A4
M = 22  # margine della cornice

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


def spaced(c, text, x, y, font, size, tracking, color, anchor="center"):
    """Testo con spaziatura tra le lettere (maiuscoletto da carta dei vini)."""
    c.setFont(font, size)
    c.setFillColor(color)
    w = pdfmetrics.stringWidth(text, font, size) + tracking * (len(text) - 1)
    x0 = x - w / 2 if anchor == "center" else x
    t = c.beginText(x0, y)
    t.setFont(font, size)
    t.setCharSpace(tracking)
    t.textOut(text)
    t.setCharSpace(0)  # la spaziatura non deve passare ai testi successivi
    c.drawText(t)
    return w


def image(c, name, x, y, w=None, h=None, anchor="bl"):
    img = ImageReader(str(ART / f"{name}.png"))
    iw, ih = img.getSize()
    if w and not h:
        h = w * ih / iw
    if h and not w:
        w = h * iw / ih
    if "r" in anchor:
        x -= w
    if "t" in anchor:
        y -= h
    if "c" in anchor:
        x -= w / 2
    c.drawImage(img, x, y, w, h, mask="auto")
    return w, h


def river(c, side):
    """Il fiume turchese della bozza come nastro sinuoso lungo un bordo della pagina."""
    def edge(offset, amp, phase):
        pts = []
        for i in range(0, 61):
            y = H - i * H / 60
            x = offset + amp * math.sin(i / 60 * math.pi * 2.6 + phase)
            pts.append((x if side == "left" else W - x, y))
        return pts
    for (o1, o2, col) in [(0, 40, PEACH), (0, 33, TEAL), (0, 20, TEAL_LIGHT)]:
        a = edge(o2, 7, 0.4)
        p = c.beginPath()
        p.moveTo(W if side == "right" else 0, H)
        for x, y in a:
            p.lineTo(x, y)
        p.lineTo(W if side == "right" else 0, 0)
        p.close()
        c.setFillColor(col)
        c.drawPath(p, stroke=0, fill=1)
    # filo d'oro sul bordo del fiume
    a = edge(36, 7, 0.4)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.6)
    p = c.beginPath()
    p.moveTo(*a[0])
    for x, y in a[1:]:
        p.lineTo(x, y)
    c.drawPath(p, stroke=1, fill=0)


def frame(c, side):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    river(c, side)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.rect(M, M, W - 2 * M, H - 2 * M, stroke=1, fill=0)


def ornament(c, x, y, w=60):
    """Filetto oro con rombo centrale."""
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.6)
    c.line(x - w, y, x - 6, y)
    c.line(x + 6, y, x + w, y)
    c.setFillColor(GOLD)
    p = c.beginPath()
    p.moveTo(x, y + 3.2); p.lineTo(x + 3.2, y); p.lineTo(x, y - 3.2); p.lineTo(x - 3.2, y); p.close()
    c.drawPath(p, stroke=0, fill=1)


def header(c, title, cx):
    spaced(c, title.upper(), cx, H - 92, "SerifMed", 20, 6, PURPLE)
    ornament(c, cx, H - 110, 70)


def entry(c, item, cx, y, width=320):
    name, ingredients, price, glass = item
    spaced(c, name.upper(), cx, y, "SerifMed", 15, 2.8, RED)
    y -= 19
    if ingredients:
        c.setFillColor(PURPLE)
        for line in simpleSplit(ingredients, "SerifIt", 11.5, width):
            c.setFont("SerifIt", 11.5)
            c.drawCentredString(cx, y, line)
            y -= 15
    y -= 2
    # prezzo e bicchiere sulla stessa riga, separati da un puntino oro
    pw = pdfmetrics.stringWidth(price, "SansMed", 11)
    gl = glass.upper() if glass else ""
    gw = (pdfmetrics.stringWidth(gl, "Sans", 6.6) + 1.6 * (len(gl) - 1)) if gl else 0
    gap = 16 if gl else 0
    x0 = cx - (pw + gap + gw) / 2
    c.setFillColor(PURPLE)
    c.setFont("SansMed", 11)
    c.drawString(x0, y, price)
    if gl:
        c.setFillColor(GOLD)
        c.circle(x0 + pw + gap / 2, y + 3.4, 1.2, stroke=0, fill=1)
        spaced(c, gl, x0 + pw + gap, y + 0.6, "Sans", 6.6, 1.6, GOLD, anchor="left")
    return y


def entry_height(item, width=320):
    _, ingredients, _, _ = item
    lines = len(simpleSplit(ingredients, "SerifIt", 11.5, width)) if ingredients else 0
    return 19 + lines * 15 + 2


def list_page(c, title, items, side, art, art_anchor, page_no, top=None):
    frame(c, side)
    # area di testo spostata dal lato del fiume
    cx = W / 2 + (14 if side == "left" else -14)
    header(c, title, cx)
    # vignetta
    if art:
        name, w = art
        if art_anchor == "br":
            image(c, name, W - M - (46 if side == "right" else 0), M, w=w, anchor="br")
        else:
            image(c, name, M + (46 if side == "left" else 0), M, w=w, anchor="bl")
    # voci distribuite in modo uniforme nello spazio disponibile
    y_top = top or H - 158
    y_bottom = 214 if art else 90
    heights = [entry_height(i) for i in items]
    gap = (y_top - y_bottom - sum(heights)) / max(1, len(items) - 1)
    gap = min(gap, 58 if len(items) > 3 else 80)
    y = y_top
    for item, h in zip(items, heights):
        entry(c, item, cx, y)
        y -= h + gap


def footer(c, cx, page_no):
    spaced(c, "RYO  ·  CHURRASCARIA  |  TAPAS  |  COCKTAIL", cx, M + 12, "Sans", 6, 1.8, GOLD)


def cover(c):
    frame(c, "right")
    image(c, "foglie-sx", M, H - M, w=150, anchor="tl")
    cx = W / 2 - 20
    image(c, "logo", cx, H - 268, w=290, anchor="bc")
    spaced(c, "COCKTAILS", cx, H - 312, "SerifMed", 15, 9, GOLD)
    spaced(c, "MENÙ", cx, H - 352, "SerifMed", 34, 12, RED)
    ornament(c, cx, H - 376, 80)
    # testo introduttivo della bozza, con le parole evidenziate
    lines = [
        [("Come le acque del fiume scorrono libere e travolgenti,", "SerifIt")],
        [("così l'arte della ", "SerifIt"), ("MIXOLOGY", "SansSemi")],
        [("dà vita a cocktail che racchiudono l'anima del Rio.", "SerifIt")],
        None,
        [("Un viaggio tra profumi, colori e sapori tropicali,", "SerifIt")],
        [("dove ogni sorso ", "SerifIt"), ("RACCONTA UNA STORIA.", "SansSemi")],
    ]
    y = H - 414
    for line in lines:
        if line is None:
            y -= 10
            continue
        sizes = {"SerifIt": 12, "SansSemi": 9.6}
        tw = sum(pdfmetrics.stringWidth(t, f, sizes[f]) + (1.2 * len(t) if f == "SansSemi" else 0) for t, f in line)
        x = cx - tw / 2
        for t, f in line:
            if f == "SansSemi":
                x += spaced(c, t, x, y + 0.5, f, sizes[f], 1.2, RED, anchor="left") + 1.2
            else:
                c.setFont(f, sizes[f]); c.setFillColor(PURPLE); c.drawString(x, y, t)
                x += pdfmetrics.stringWidth(t, f, sizes[f])
        y -= 19
    image(c, "parrot", M + 6, M, w=230, anchor="bl")
    image(c, "foglie-dx", W - M - 46, H - M, w=130, anchor="tr")


def main():
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("RYO · Cocktails menù")
    c.setAuthor("RYO Churrascaria | Tapas | Cocktail")
    cover(c)
    c.showPage()
    pages = [(COCKTAILS[0:7], "left", ("scimmia", 170), "br"),
             (COCKTAILS[7:13], "right", ("tucano", 190), "bl"),
             (COCKTAILS[13:19], "left", ("giaguaro", 200), "br")]
    for n, (items, side, art, anchor) in enumerate(pages, start=2):
        list_page(c, "Cocktails", items, side, art, anchor, n)
        c.showPage()
    list_page(c, "Analcolici", ANALCOLICI, "right", ("fenicottero", 230), "bl", 5, top=H - 170)
    c.showPage()
    c.save()
    print("creato", OUT)


if __name__ == "__main__":
    main()
