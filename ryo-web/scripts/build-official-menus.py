"""
Crea i PDF dei menu dalle pagine ufficiali del locale (scripts/menu-pdf/*.jpg, ritagliate al
filo delle crocette di taglio dal PDF di stampa):

  ryo-menu-cucina.pdf     tutte le pagine
  ryo-menu-alacarte.pdf   Churrasco + Tapas, Platos + Ensaladas, Primi + Carnes + Sides
  ryo-menu-churrasco.pdf  solo il riquadro Churrasco Menù
  ryo-menu-dessert.pdf    Dulce

  python3 scripts/build-official-menus.py

Quando arriva il PDF originale del grafico basta copiarlo in public/menu/ con questi nomi.
"""
import io
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "menu-pdf"
OUT = ROOT / "public" / "menu"


def pdf(name, files, title):
    pages = []
    for f in files:
        buf = io.BytesIO()
        Image.open(SRC / f).convert("RGB").save(buf, "JPEG", quality=88)
        pages.append(Image.open(buf))
    pages[0].save(OUT / name, "PDF", resolution=150, save_all=True, append_images=pages[1:], title=title, author="RYO")
    print("creato", OUT / name)


pagine = [f"pagina-{i}.jpg" for i in range(1, 5)]
pdf("ryo-menu-cucina.pdf", pagine, "RYO — Menu")
pdf("ryo-menu-alacarte.pdf", pagine[:3], "RYO — Menu à la carte")
pdf("ryo-menu-churrasco.pdf", ["churrasco.jpg"], "RYO — Churrasco Menù")
pdf("ryo-menu-dessert.pdf", pagine[3:], "RYO — Dulce")
