"""
Genera i menu PDF di RYO da src/content/carta.json.

  python3 scripts/build-menu-pdf.py

Produce public/menu/ryo-menu-cucina.pdf e public/menu/ryo-drink-list.pdf (formato A5).
Richiede reportlab.
"""

import json
import math
from pathlib import Path

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
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
OUT = ROOT / "public" / "menu"
LOGO_LIGHT = ROOT / "public" / "images" / "brand" / "wordmark-light.png"
LOGO_DARK = ROOT / "public" / "images" / "brand" / "wordmark-dark.png"

for name, file in {
    "Serif": "PlayfairDisplay-Regular.ttf",
    "Serif-Medium": "PlayfairDisplay-Medium.ttf",
    "Serif-Italic": "PlayfairDisplay-Italic.ttf",
    "Sans-Light": "Montserrat-Light.ttf",
    "Sans": "Montserrat-Regular.ttf",
    "Sans-Medium": "Montserrat-Medium.ttf",
    "Sans-SemiBold": "Montserrat-SemiBold.ttf",
}.items():
    pdfmetrics.registerFont(TTFont(name, str(FONTS / file)))

GREEN = HexColor("#0d2618")
GREEN_2 = HexColor("#123524")
CREAM = HexColor("#efe6d2")
PAPER = HexColor("#f4ecdb")
INK = HexColor("#123524")
GOLD = HexColor("#b8955a")
GOLD_LIGHT = HexColor("#e6d3a6")
MUTED = HexColor("#5b6b5f")

W, H = A5
M = 16 * mm

carta = json.loads((ROOT / "src" / "content" / "carta.json").read_text())

# ── Stili ──
s_section = ParagraphStyle("section", fontName="Serif-Italic", fontSize=28, leading=32, textColor=INK, alignment=TA_CENTER, spaceAfter=4)
s_name = ParagraphStyle("name", fontName="Serif-Medium", fontSize=11.5, leading=14, textColor=INK)
s_desc = ParagraphStyle("desc", fontName="Sans-Light", fontSize=7.6, leading=10.4, textColor=MUTED)
s_price = ParagraphStyle("price", fontName="Sans-Medium", fontSize=9.5, leading=14, textColor=INK, alignment=2)
s_note = ParagraphStyle("note", fontName="Sans-Light", fontSize=7, leading=10, textColor=MUTED, alignment=TA_CENTER)


# ── Decorazioni ──
def frond(c, x, y, rot, scale, color, alpha):
    """Fronda di felce stilizzata (stessa famiglia della trama del sito)."""
    c.saveState()
    c.translate(x, y)
    c.rotate(rot)
    c.setFillColor(color)
    c.setStrokeColor(color)
    c.setFillAlpha(alpha)
    c.setStrokeAlpha(alpha)
    L = 120 * scale
    c.setLineWidth(1.2 * scale)
    p = c.beginPath()
    p.moveTo(0, 0)
    p.curveTo(L * 0.1, L * 0.35, L * 0.08, L * 0.7, 0, L)
    c.drawPath(p, stroke=1, fill=0)
    for i in range(1, 15):
        t = i / 15
        py = L * t
        px = L * 0.08 * math.sin(t * math.pi)
        size = (1 - t) * 17 * scale + 3 * scale
        for side in (-1, 1):
            c.saveState()
            c.translate(px, py)
            c.rotate(side * (58 - 22 * t))
            c.ellipse(0 if side > 0 else -size * 1.2, -size * 0.16, size * 1.2 if side > 0 else 0, size * 0.16, stroke=0, fill=1)
            c.restoreState()
    c.restoreState()


def fern_texture(c, color, alpha):
    spots = [(20, 60, -20, 1.0), (120, 30, 25, 0.8), (W - 40, 120, 30, 1.1), (60, H - 170, -10, 0.9),
             (W - 90, H - 110, 18, 0.8), (W / 2, H / 2 - 60, -35, 0.7), (W - 20, H / 2 + 40, 40, 0.9), (10, H / 2, -40, 0.8)]
    for x, y, r, s in spots:
        frond(c, x, y, r, s, color, alpha)


def draw_logo(c, path, cx, cy, width):
    img = ImageReader(str(path))
    iw, ih = img.getSize()
    h = width * ih / iw
    c.drawImage(img, cx - width / 2, cy - h / 2, width, h, mask="auto")


def cream_page(title):
    def draw(c, doc):
        c.saveState()
        c.setFillColor(PAPER)
        c.rect(0, 0, W, H, stroke=0, fill=1)
        fern_texture(c, INK, 0.045)
        draw_logo(c, LOGO_DARK, W / 2, H - 10 * mm, 22 * mm)
        c.setFont("Sans", 6.5)
        c.setFillColor(MUTED)
        c.drawString(M, 8 * mm, title.upper())
        c.drawRightString(W - M, 8 * mm, f"{doc.page}")
        c.restoreState()
    return draw


def cover(subtitle, note):
    def draw(c, doc):
        c.saveState()
        c.setFillColor(GREEN)
        c.rect(0, 0, W, H, stroke=0, fill=1)
        fern_texture(c, CREAM, 0.06)
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.6)
        c.rect(8 * mm, 8 * mm, W - 16 * mm, H - 16 * mm, stroke=1, fill=0)
        draw_logo(c, LOGO_LIGHT, W / 2, H / 2 + 22 * mm, 92 * mm)
        c.setFillColor(CREAM)
        c.setFont("Serif-Italic", 30)
        c.drawCentredString(W / 2, H / 2 - 22 * mm, subtitle)
        c.setFont("Sans", 7)
        c.setFillColor(GOLD_LIGHT)
        c.drawCentredString(W / 2, 22 * mm, note.upper())
        c.drawCentredString(W / 2, 17 * mm, "CORSO UMBERTO I, 1 · CAVA DE' TIRRENI")
        c.restoreState()
    return draw


def churrasco_page(c, doc):
    """Pagina dedicata al Menu Churrasco: deve risaltare sempre."""
    ch = carta["churrasco"]
    c.saveState()
    c.setFillColor(GREEN)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    # bagliore della brace
    for i in range(18, 0, -1):
        c.setFillColor(HexColor("#c8794d"))
        c.setFillAlpha(0.012)
        c.circle(W / 2, 26 * mm, i * 7 * mm, stroke=0, fill=1)
    c.setFillAlpha(1)
    fern_texture(c, CREAM, 0.05)
    # doppia cornice oro
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.2)
    c.rect(9 * mm, 9 * mm, W - 18 * mm, H - 18 * mm, stroke=1, fill=0)
    c.setLineWidth(0.4)
    c.rect(11 * mm, 11 * mm, W - 22 * mm, H - 22 * mm, stroke=1, fill=0)

    draw_logo(c, LOGO_LIGHT, W / 2, H - 28 * mm, 46 * mm)
    c.setFillColor(GOLD_LIGHT)
    c.setFont("Sans-Medium", 7.5)
    c.drawCentredString(W / 2, H - 44 * mm, "L'ESPERIENZA DELLA CASA")
    c.setFillColor(CREAM)
    c.setFont("Serif-Italic", 40)
    c.drawCentredString(W / 2, H - 64 * mm, "Churrasco")
    c.setFont("Serif", 16)
    c.drawCentredString(W / 2, H - 74 * mm, "Menù")
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.6)
    c.line(W / 2 - 18 * mm, H - 80 * mm, W / 2 + 18 * mm, H - 80 * mm)
    c.setFont("Serif-Medium", 15)
    c.drawCentredString(W / 2, H - 92 * mm, ch["titolo"])
    c.setFont("Sans-Light", 9)
    c.setFillColor(GOLD_LIGHT)
    c.drawCentredString(W / 2, H - 100 * mm, ch["descrizione"])

    # le 5 carni
    y = H - 116 * mm
    c.setFont("Serif-Italic", 13)
    c.setFillColor(CREAM)
    for carne in ch["carni"]:
        c.drawCentredString(W / 2, y, carne)
        y -= 7.5 * mm

    # prezzo in un medaglione
    c.setFillColor(GOLD)
    c.circle(W / 2, 30 * mm, 13 * mm, stroke=0, fill=1)
    c.setFillColor(GREEN)
    c.setFont("Serif-Medium", 20)
    c.drawCentredString(W / 2, 28 * mm, ch["prezzo"].replace(" ", ""))
    c.setFont("Sans-Medium", 5.5)
    c.drawCentredString(W / 2, 23.5 * mm, "A PERSONA")
    c.restoreState()


def item_row(p):
    left = [Paragraph(p["nome"], s_name)]
    if p.get("descrizione"):
        left.append(Paragraph(p["descrizione"], s_desc))
    t = Table([[left, Paragraph(p["prezzo"], s_price)]], colWidths=[W - 2 * M - 18 * mm, 18 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.3, Color(0.07, 0.21, 0.14, 0.18)),
    ]))
    return t


def section(cat):
    rows = [item_row(p) for p in cat["piatti"]]
    head = [Spacer(1, 4 * mm), Paragraph(cat["nome"], s_section), Spacer(1, 3 * mm)]
    # il titolo non resta mai da solo in fondo alla pagina
    return [CondPageBreak(60 * mm), KeepTogether(head + rows[:2]), *rows[2:]]


def build(filename, title, subtitle, categories, with_churrasco):
    doc = BaseDocTemplate(str(OUT / filename), pagesize=A5, leftMargin=M, rightMargin=M, topMargin=24 * mm, bottomMargin=16 * mm,
                          title=f"RYO · {title}", author="RYO Churrascaria · Tapas · Cocktail")
    frame = Frame(M, 16 * mm, W - 2 * M, H - 40 * mm, id="f", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    blank = Frame(M, M, W - 2 * M, H - 2 * M, id="b")
    templates = [PageTemplate("cover", [blank], onPage=cover(subtitle, carta["aggiornato"]))]
    if with_churrasco:
        templates.append(PageTemplate("churrasco", [blank], onPage=churrasco_page))
    templates.append(PageTemplate("cream", [frame], onPage=cream_page(title)))
    doc.addPageTemplates(templates)

    story = [NextPageTemplate("churrasco" if with_churrasco else "cream"), Spacer(1, 1), PageBreak()]
    if with_churrasco:
        story += [NextPageTemplate("cream"), Spacer(1, 1), PageBreak()]
    for cat in categories:
        story += section(cat)
    story += [Spacer(1, 10 * mm)]
    if with_churrasco:
        story.append(Paragraph(carta["coperto"], s_note))
    story.append(Paragraph("Per allergie e intolleranze chiedi al personale: ti indicheremo gli allergeni presenti in ogni preparazione (Reg. UE 1169/2011).", s_note))
    doc.build(story)
    print("creato", OUT / filename)


OUT.mkdir(parents=True, exist_ok=True)
build("ryo-menu-cucina.pdf", "Menu cucina", "Menu cucina", carta["cucina"], with_churrasco=True)
build("ryo-drink-list.pdf", "Drink list", "Drink list", carta["drink"], with_churrasco=False)
