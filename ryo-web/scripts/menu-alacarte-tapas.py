"""
Prima pagina del menu à la carte senza il riquadro Churrasco (che ha il suo PDF): il titolo
Tapas sale al posto di «Churrasco Menù» e i piatti si distribuiscono su tutta la pagina,
un po' più grandi, con la stessa disposizione dell'originale. Scimmia, tucano, foglie,
timbro RYO e ananas restano dove sono.

  python3 scripts/menu-alacarte-tapas.py   (scrive scripts/menu-pdf/pagina-1-tapas.jpg)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "menu-pdf" / "pagina-1.jpg"
OUT = ROOT / "scripts" / "menu-pdf" / "pagina-1-tapas.jpg"

SCALE = 1.15  # ingrandimento dei piatti
TOP = 505  # dove inizia la prima riga di piatti
STRETCH = 1.42  # quanto si allarga lo spazio verticale tra le righe
ORIG_TOP = 830

# riquadri approssimativi dei blocchi nell'originale (x0, y0, x1, y1): il contenuto vero si ricava dai pixel
TITLE = (505, 660, 745, 800)
DISHES = {
    "croquetas": (80, 830, 550, 1010),
    "polpetta": (760, 830, 1205, 1010),
    "pollo-carioca": (505, 962, 815, 1130),
    "pan-tostado": (45, 1115, 580, 1370),
    "gamberi": (795, 1120, 1170, 1360),
    "tortillas": (35, 1420, 590, 1640),
    "empanadas": (805, 1420, 1160, 1665),
}


def content_box(img, box):
    """Riquadro stretto attorno a ciò che non è bianco."""
    a = np.asarray(img.crop(box).convert("L"))
    ys, xs = np.where(a < 225)
    x0, y0 = box[0], box[1]
    return (x0 + xs.min() - 4, y0 + ys.min() - 4, x0 + xs.max() + 5, y0 + ys.max() + 5)


def main():
    src = Image.open(SRC).convert("RGB")
    W, H = src.size
    page = src.copy()
    white = Image.new("RGB", (W, H), "white")

    def clear(box):
        page.paste(white.crop(box), box)

    # via «Churrasco Menù» e la descrizione della degustazione (sono su fondo bianco), senza toccare
    # il timbro RYO (fino a x 470, y 388) né la foglia di monstera a sinistra (fino a y ~520)
    clear((471, 325, 800, 400))
    clear((380, 389, 845, 472))
    clear((395, 478, 1062, 520))
    clear((280, 520, 1062, 553))
    clear((185, 553, 1062, 652))
    # la «C» di Churrasco sotto il timbro: via i suoi pixel verde scuro, il timbro (oliva e bianco) resta
    a = np.asarray(page).copy()
    orig = np.asarray(src).astype(int)[300:400, 380:471]
    zone = a[300:400, 380:471]
    olive = np.array([155, 155, 120])
    far_olive = np.abs(orig - olive).sum(axis=2) > 70
    zone[far_olive] = 255  # tutto ciò che non è il verde oliva del timbro torna bianco (anche gli aloni)
    zone[zone.mean(axis=2) > 185] = 255  # e gli aloni chiari lasciati dalla compressione
    # sotto il bordo inferiore del timbro (una diagonale da (220, 405) a (460, 330)) resta solo carta bianca
    yy, xx = np.mgrid[300:400, 380:471]
    zone[yy > 405 - (xx - 220) * 0.3125 + 10] = 255
    page = Image.fromarray(a)
    # via titolo e piatti dalla posizione originale, senza toccare l'ananas in basso
    clear((0, 655, W, 1470))
    clear((0, 1470, 640, 1550))
    clear((0, 1550, 500, H))
    clear((790, 1470, W, H))

    # i piatti da spostare: si incollano in «moltiplica», così il bianco non copre l'ananas
    # i riquadri di Croquetas e Polpetta toccano le lettere di «Pollo Carioca»: si usano senza
    neighbours = src.copy()
    neighbours.paste(white.crop((512, 962, 808, 1133)), (512, 962))
    neighbours.paste(white.crop((538, 828, 560, 1012)), (538, 828))
    tortillas_src = src.copy()
    tortillas_src.paste(white.crop((500, 1505, 640, 1700)), (500, 1505))  # foglie d'ananas dentro il riquadro

    def place(img, box, new_top, cx=None):
        b = content_box(img, box)
        piece = img.crop(b)
        piece = piece.resize((round(piece.width * SCALE), round(piece.height * SCALE)), Image.LANCZOS)
        cx = (b[0] + b[2]) / 2 if cx is None else cx
        x = round(cx - piece.width / 2)
        x = max(8, min(W - piece.width - 8, x))
        layer = Image.new("RGB", (W, H), "white")
        layer.paste(piece, (x, round(new_top)))
        return ImageChops.multiply(page, layer)

    page = place(src, TITLE, 345, cx=625)
    for name, box in DISHES.items():
        img = tortillas_src if name == "tortillas" else neighbours if name in ("croquetas", "polpetta") else src
        b = content_box(img, box)
        new_top = TOP + (b[1] - ORIG_TOP) * STRETCH
        page = place(img, box, new_top)

    page.save(OUT, quality=92)
    print("creato", OUT)


if __name__ == "__main__":
    main()
