"""
Genera i menu PDF di RYO da src/content/carta.json, con la grafica dei menu cartacei del locale:
  - Menu cucina: carta bianca, illustrazioni botaniche (scimmia, tucano, pantera, ananas, fiori),
    titoli in corsivo a pennello, "Menù" in rosso, pagina dedicata al Churrasco.
  - Drink list: copertina con il serpente, trama rosso/viola, titoli e prezzi rossi su carta crema.

  npm run menu:pdf      (oppure: python3 scripts/build-menu-pdf.py)

Le illustrazioni in scripts/menu-art/ sono ricavate dalle foto dei menu stampati:
sostituirle con i file originali del grafico appena disponibili (stessi nomi).
"""

import json
from pathlib import Path

import sys
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A5
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, CondPageBreak, Frame, KeepTogether, NextPageTemplate, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "scripts" / "fonts"
ART = ROOT / "scripts" / "menu-art"
OUT = ROOT / "public" / "menu"

for name, file in {
    "Brush": "CaveatBrush-Regular.ttf",
    "Grotesk": "SpaceGrotesk-Regular.ttf",
    "Grotesk-Medium": "SpaceGrotesk-Medium.ttf",
    "Display": "Syne-ExtraBold.ttf",
    "Sans": "Montserrat-Regular.ttf",
    "Sans-Bold": "Montserrat-Bold.ttf",
}.items():
    pdfmetrics.registerFont(TTFont(name, str(FONTS / file)))

W, H = A5
carta = json.loads((ROOT / "src" / "content" / "carta.json").read_text())

# ── Palette dei menu stampati ──
PAPER = HexColor("#fbfaf6")
INK = HexColor("#151515")
GREY = HexColor("#3c3c3c")
RED_SCRIPT = HexColor("#c8392b")
DRINK_PAPER = HexColor("#f4ede1")
DRINK_RED = HexColor("#c41e3a")
DRINK_ORANGE = HexColor("#f3a660")
DRINK_GREEN = HexColor("#1f4d3a")
DRINK_INK = HexColor("#1d1d1d")


def art(name):
    return ImageReader(str(next(ART.glob(f"{name}.*"))))


def place(c, name, x, y, width=None, height=None, anchor="sw"):
    """Disegna un'illustrazione; anchor indica quale angolo cade su (x, y)."""
    img = art(name)
    iw, ih = img.getSize()
    if width and not height:
        height = width * ih / iw
    elif height and not width:
        width = height * iw / ih
    dx = {"w": 0, "e": -width, "c": -width / 2}[anchor[1] if len(anchor) == 2 else "c"]
    dy = {"s": 0, "n": -height, "c": -height / 2}[anchor[0]]
    c.drawImage(img, x + dx, y + dy, width, height, mask="auto")


def cover_image(c, name):
    """Immagine a tutta pagina, ritagliata al centro."""
    img = art(name)
    iw, ih = img.getSize()
    scale = max(W / iw, H / ih)
    w, h = iw * scale, ih * scale
    c.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)


# ═════════════════════════ MENU CUCINA ═════════════════════════

s_section = ParagraphStyle("section", fontName="Brush", fontSize=32, leading=34, textColor=INK, alignment=TA_CENTER)
s_name = ParagraphStyle("name", fontName="Grotesk-Medium", fontSize=11.5, leading=14, textColor=INK, alignment=TA_CENTER)
s_desc = ParagraphStyle("desc", fontName="Grotesk", fontSize=8.4, leading=11, textColor=GREY, alignment=TA_CENTER)
s_price = ParagraphStyle("price", fontName="Grotesk-Medium", fontSize=10.5, leading=14, textColor=INK, alignment=TA_CENTER)
s_note = ParagraphStyle("note", fontName="Grotesk", fontSize=7.4, leading=10, textColor=GREY, alignment=TA_CENTER)

# Decorazioni a rotazione sulle pagine interne (come nel menu stampato)
FOOD_DECOR = [
    lambda c: (place(c, "fiori-ramo", W - 8 * mm, H, width=82 * mm, anchor="ne"),
               place(c, "fiore-arancio", W, 0, width=30 * mm, anchor="se")),
    lambda c: (place(c, "foglie-alto", W, H, width=28 * mm, anchor="ne"),
               place(c, "foglie-lato", W, 6 * mm, height=70 * mm, anchor="se")),
    lambda c: (place(c, "scimmia", 0, H, width=40 * mm, anchor="nw"),
               place(c, "ramo-fiore-rosso", W, H, width=52 * mm, anchor="ne")),
]


def food_page(c, doc):
    c.saveState()
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    FOOD_DECOR[(doc.page - 3) % len(FOOD_DECOR)](c)
    c.setFont("Grotesk-Medium", 6.2)
    c.setFillColor(GREY)
    c.drawCentredString(W / 2, 7 * mm, carta["coperto"].upper())
    c.restoreState()


def food_last_page(c, doc):
    c.saveState()
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    place(c, "scimmia", 0, H, width=38 * mm, anchor="nw")
    place(c, "ramo-fiore-rosso", W, H, width=48 * mm, anchor="ne")
    place(c, "pantera", W, 0, height=92 * mm, anchor="se")
    place(c, "ananas-sigillo", 0, 0, height=70 * mm, anchor="sw")
    c.restoreState()


def food_cover(c, doc):
    c.setFillColor(HexColor("#121212"))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    img = art("copertina-cucina")
    iw, ih = img.getSize()
    s = min(W / iw, H / ih)
    c.drawImage(img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s)


def churrasco_page(c, doc):
    """Pagina dedicata al Churrasco: il piatto forte, sempre in evidenza."""
    ch = carta["churrasco"]
    c.saveState()
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    place(c, "scimmia-ramo", 0, H, width=58 * mm, anchor="nw")
    place(c, "tucano", W, H, width=56 * mm, anchor="ne")
    place(c, "ananas", W / 2, 0, width=44 * mm, anchor="sc")

    # etichetta RYO (come la targhetta del menu stampato)
    c.setFillColor(HexColor("#8f7f6a"))
    c.roundRect(W / 2 - 16 * mm, H - 72 * mm, 32 * mm, 11 * mm, 5.5 * mm, stroke=0, fill=1)
    c.setFillColor(PAPER)
    c.setFont("Display", 15)
    c.drawCentredString(W / 2, H - 68.6 * mm, "RYO")

    c.setFillColor(INK)
    c.setFont("Brush", 58)
    c.drawCentredString(W / 2, H - 92 * mm, "Churrasco")
    c.setFillColor(RED_SCRIPT)
    c.setFont("Brush", 28)
    c.drawCentredString(W / 2 + 26 * mm, H - 102 * mm, "Menù")

    c.setFillColor(INK)
    c.setFont("Grotesk-Medium", 15)
    c.drawCentredString(W / 2, H - 116 * mm, ch["titolo"])
    c.setFont("Grotesk", 9.5)
    c.setFillColor(GREY)
    c.drawCentredString(W / 2, H - 123 * mm, ch["descrizione"])
    c.drawCentredString(W / 2, H - 129 * mm, "(" + ", ".join(ch["carni"]) + ")")

    # prezzo in evidenza
    c.setFillColor(RED_SCRIPT)
    c.circle(W / 2, H - 146 * mm, 11 * mm, stroke=0, fill=1)
    c.setFillColor(PAPER)
    c.setFont("Grotesk-Medium", 17)
    c.drawCentredString(W / 2, H - 147.5 * mm, ch["prezzo"].replace(" ", ""))
    c.setFont("Grotesk", 5.6)
    c.drawCentredString(W / 2, H - 152 * mm, "A PERSONA")
    c.restoreState()


def food_item(p):
    rows = [Paragraph(p["nome"], s_name)]
    if p.get("descrizione"):
        rows.append(Paragraph(p["descrizione"], s_desc))
    rows += [Spacer(1, 1 * mm), Paragraph(p["prezzo"].replace(" ", ""), s_price), Spacer(1, 3.6 * mm)]
    return rows


def food_section(cat):
    items = [food_item(p) for p in cat["piatti"]]
    head = [Spacer(1, 2 * mm), Paragraph(cat["nome"], s_section), Spacer(1, 3.5 * mm)]
    # niente KeepTogether annidati: reportlab ne sovrastima l'altezza e va a pagina nuova
    if len(cat["piatti"]) <= 5:  # sezioni brevi: tutte su una pagina
        return [CondPageBreak(75 * mm), KeepTogether(head + [f for i in items for f in i])]
    return [CondPageBreak(75 * mm), KeepTogether(head + items[0]), *[KeepTogether(i) for i in items[1:]]]


def build_food():
    doc = BaseDocTemplate(str(OUT / "ryo-menu-cucina.pdf"), pagesize=A5, title="RYO · Menu cucina",
                          author="RYO Churrascaria · Tapas · Cocktail")
    content = Frame(24 * mm, 13 * mm, W - 48 * mm, H - 45 * mm, id="c", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    last = Frame(26 * mm, 70 * mm, W - 52 * mm, H - 104 * mm, id="l", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    blank = Frame(0, 0, W, H, id="b")
    doc.addPageTemplates([
        PageTemplate("cover", [blank], onPage=food_cover),
        PageTemplate("churrasco", [blank], onPage=churrasco_page),
        PageTemplate("food", [content], onPage=food_page),
        PageTemplate("last", [last], onPage=food_last_page),
    ])
    story = [NextPageTemplate("churrasco"), Spacer(1, 1), PageBreak(), NextPageTemplate("food"), Spacer(1, 1), PageBreak()]
    cats = carta["cucina"]
    for cat in cats[:-1]:
        story += food_section(cat)
    # i dolci chiudono il menu nella pagina con pantera e sigillo RYO
    story += [NextPageTemplate("last"), PageBreak(), *food_section(cats[-1]), Spacer(1, 6 * mm),
              Paragraph("Per allergie e intolleranze chiedi al personale: ti indicheremo gli allergeni presenti in ogni preparazione.", s_note)]
    doc.build(story)
    print("creato", OUT / "ryo-menu-cucina.pdf")


# ═════════════════════════ DRINK LIST ═════════════════════════

d_title = ParagraphStyle("dtitle", fontName="Display", fontSize=36, leading=36, textColor=DRINK_RED)
d_name = ParagraphStyle("dname", fontName="Sans-Bold", fontSize=11, leading=13.5, textColor=DRINK_RED)
d_price = ParagraphStyle("dprice", fontName="Sans-Bold", fontSize=12, leading=13.5, textColor=DRINK_RED, alignment=2)
d_desc = ParagraphStyle("ddesc", fontName="Sans", fontSize=8, leading=10.2, textColor=DRINK_INK)

BORDER = 9 * mm


def tile_pattern(c, x0, y0, x1, y1):
    img = art("trama-drink")
    iw, ih = img.getSize()
    tw = 22 * mm
    th = tw * ih / iw
    c.saveState()
    p = c.beginPath()
    p.rect(x0, y0, x1 - x0, y1 - y0)
    c.clipPath(p, stroke=0, fill=0)
    y = y0
    while y < y1:
        x = x0
        while x < x1:
            c.drawImage(img, x, y, tw, th)
            x += tw
        y += th
    c.restoreState()


def drink_cover(c, doc):
    tile_pattern(c, 0, 0, W, H)
    img = art("copertina-drink")
    iw, ih = img.getSize()
    w = W - 2 * BORDER
    h = w * ih / iw
    c.drawImage(img, BORDER, (H - h) / 2, w, h)


def drink_page(c, doc):
    c.saveState()
    tile_pattern(c, 0, 0, W, H)
    c.setFillColor(DRINK_PAPER)
    c.rect(BORDER, BORDER, W - 2 * BORDER, H - 2 * BORDER, stroke=0, fill=1)
    # triangolo arancio dietro il titolo
    c.setFillColor(DRINK_ORANGE)
    p = c.beginPath()
    p.moveTo(BORDER, H - BORDER)
    p.lineTo(BORDER + 62 * mm, H - BORDER)
    p.lineTo(BORDER, H - BORDER - 40 * mm)
    p.close()
    c.drawPath(p, stroke=0, fill=1)
    # colline rosse e verdi in basso
    c.setFillColor(DRINK_RED)
    p = c.beginPath()
    p.moveTo(W - BORDER - 78 * mm, BORDER)
    p.curveTo(W - BORDER - 58 * mm, BORDER + 18 * mm, W - BORDER - 40 * mm, BORDER + 20 * mm, W - BORDER - 22 * mm, BORDER)
    p.close()
    c.drawPath(p, stroke=0, fill=1)
    c.setFillColor(DRINK_GREEN)
    p = c.beginPath()
    p.moveTo(W - BORDER - 36 * mm, BORDER)
    p.curveTo(W - BORDER - 18 * mm, BORDER + 8 * mm, W - BORDER - 6 * mm, BORDER + 16 * mm, W - BORDER, BORDER + 22 * mm)
    p.lineTo(W - BORDER, BORDER)
    p.close()
    c.drawPath(p, stroke=0, fill=1)
    c.restoreState()


def drink_item(p):
    t = Table([[Paragraph(p["nome"].upper(), d_name), Paragraph(p["prezzo"].replace(" ", ""), d_price)],
               [Paragraph(p["descrizione"], d_desc), ""]],
              colWidths=[W - 2 * BORDER - 22 * mm - 18 * mm, 18 * mm])
    t.setStyle(TableStyle([
        ("SPAN", (0, 1), (1, 1)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 1.5),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 4.5),
        ("LINEBELOW", (0, 1), (-1, 1), 0.5, DRINK_RED),
    ]))
    return t


def drink_section(cat):
    words = cat["nome"].upper().split(" ")
    lines = words if len(words) > 1 else [cat["nome"].upper()]
    avail = W - 2 * BORDER - 22 * mm
    size = min(36, min(avail / pdfmetrics.stringWidth(l, "Display", 1) for l in lines) * 0.98)
    style = ParagraphStyle("t", parent=d_title, fontSize=size, leading=size * 0.98)
    title = Paragraph("<br/>".join(lines), style)
    items = [drink_item(p) for p in cat["piatti"]]
    return [PageBreak(), title, Spacer(1, 7 * mm), *items]


def build_drink():
    doc = BaseDocTemplate(str(OUT / "ryo-drink-list.pdf"), pagesize=A5, title="RYO · Drink list",
                          author="RYO Churrascaria · Tapas · Cocktail")
    content = Frame(BORDER + 11 * mm, BORDER + 18 * mm, W - 2 * BORDER - 22 * mm, H - 2 * BORDER - 28 * mm, id="c",
                    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    blank = Frame(0, 0, W, H, id="b")
    doc.addPageTemplates([
        PageTemplate("cover", [blank], onPage=drink_cover),
        PageTemplate("drink", [content], onPage=drink_page),
    ])
    story = [NextPageTemplate("drink"), Spacer(1, 1)]
    for cat in carta["drink"]:
        story += drink_section(cat)
    doc.build(story)
    print("creato", OUT / "ryo-drink-list.pdf")


OUT.mkdir(parents=True, exist_ok=True)
# I menu cucina ora sono quelli ufficiali del locale (scripts/build-official-menus.py):
# build_food() resta solo come riferimento e non sovrascrive più i PDF.
if "--cucina" in sys.argv:
    build_food()
build_drink()
