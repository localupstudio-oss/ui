"""
Crea i PDF dei menu dalle pagine ufficiali del locale (scripts/menu-pdf/*.jpg, ritagliate al
filo delle crocette di taglio dal PDF di stampa):

  ryo-menu-cucina.pdf     tutte le pagine
  ryo-menu-alacarte.pdf   Tapas, Platos + Ensaladas, Primi + Carnes + Sides, Allergeni
                          (la prima pagina senza Churrasco: scripts/menu-alacarte-tapas.py;
                          la pagina allergeni: scripts/menu-allergeni.py)
  ryo-menu-churrasco.pdf  pagina unica del Churrasco Menù (scripts/menu-churrasco.py)
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


def pdf(name, files, title, out=OUT):
    pages = []
    for f in files:
        buf = io.BytesIO()
        Image.open(SRC / f).convert("RGB").save(buf, "JPEG", quality=88)
        pages.append(Image.open(buf))
    pages[0].save(out / name, "PDF", resolution=150, save_all=True, append_images=pages[1:], title=title, author="RYO")
    print("creato", out / name)


pagine = [f"pagina-{i}.jpg" for i in range(1, 5)]
pdf("ryo-menu-cucina.pdf", pagine, "RYO — Menu")
pdf("ryo-menu-alacarte.pdf", ["pagina-1-tapas.jpg", *pagine[1:3], "allergeni.jpg"], "RYO — Menu à la carte")
pdf("ryo-menu-churrasco.pdf", ["churrasco-menu.jpg"], "RYO — Churrasco Menù")
pdf("ryo-menu-dessert.pdf", pagine[3:], "RYO — Dulce")
