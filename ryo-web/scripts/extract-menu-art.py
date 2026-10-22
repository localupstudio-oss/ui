import sys
from PIL import Image, ImageFilter, ImageOps
import numpy as np
U, D = sys.argv[1], sys.argv[2]
K = 1512 / 1500
def load(f): return Image.open(f"{U}/{f}-image.jpg").convert("RGB")

def keyed(img):
    a = np.asarray(img).astype(np.float32)
    lum = a.mean(axis=2)
    paper = np.median(a[lum >= np.percentile(lum, 70)], axis=0)
    pn = np.clip(a * (255.0 / paper), 0, 255)
    dist = np.sqrt(((pn - 255.0) ** 2).sum(axis=2))
    al = np.clip((dist - 58) / 55, 0, 1) ** 1.1  # la pagina è bianca: le parti chiare possono sparire
    al_img = Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
    al = np.asarray(al_img).astype(np.float32) / 255
    with np.errstate(divide="ignore", invalid="ignore"):
        c = (pn - 255.0 * (1 - al[..., None])) / np.maximum(al[..., None], 1e-3)
    c = np.clip(np.nan_to_num(c), 0, 255)
    # un po' di contrasto e saturazione: le foto sono in luce bassa
    out = Image.fromarray(np.dstack([c, al * 255]).astype(np.uint8), "RGBA")
    return out

def trim_dark_edges(k):
    """Toglie bande scure ai bordi (tavolo, pagina accanto) rimaste nel ritaglio."""
    a = np.asarray(k).astype(np.float32)
    dark = (a[..., 3] > 200) & (a[..., :3].mean(axis=2) < 70)
    h, w = dark.shape
    top, bot, left, right = 0, h, 0, w
    while bot - top > 20 and dark[bot - 1, left:right].mean() > 0.45: bot -= 1
    while bot - top > 20 and dark[top, left:right].mean() > 0.45: top += 1
    while right - left > 20 and dark[top:bot, right - 1].mean() > 0.45: right -= 1
    while right - left > 20 and dark[top:bot, left].mean() > 0.45: left += 1
    return k.crop((left, top, right, bot))

def crop(f, box, name, trim=True):
    im = load(f).crop(tuple(round(v * K) for v in box))
    k = keyed(im)
    if trim: k = trim_dark_edges(k)
    bb = k.getchannel("A").point(lambda v: 255 if v > 30 else 0).getbbox()
    if bb: k = k.crop(bb)
    k.save(f"{D}/{name}.png"); print(name, k.size)

def quad(f, q, size, name, enhance=True):
    # q = TL, BL, BR, TR
    im = load(f).transform(size, Image.QUAD, tuple(round(v * K) for p in q for v in p), Image.BICUBIC)
    if enhance: im = ImageOps.autocontrast(im, cutoff=1)
    im.save(f"{D}/{name}.jpg", quality=90); print(name, im.size)

crop("d2f0769b", (220, 255, 525, 430), "scimmia-ramo")
crop("d2f0769b", (962, 245, 1278, 592), "tucano")
crop("d2f0769b", (640, 1570, 1010, 1945), "ananas")
crop("03fe2188", (590, 240, 1240, 462), "fiori-ramo")
crop("03fe2188", (1062, 1545, 1325, 1985), "fiore-arancio")
crop("35be9889", (1132, 200, 1308, 340), "foglie-alto")
crop("35be9889", (1282, 1240, 1425, 1830), "foglie-lato")
crop("79a8efb8", (172, 205, 490, 470), "scimmia")
crop("79a8efb8", (840, 160, 1268, 520), "ramo-fiore-rosso")
crop("79a8efb8", (950, 885, 1298, 1958), "pantera", trim=False)
crop("79a8efb8", (78, 1240, 430, 1930), "ananas-sigillo")
quad("6f21f219", [(255, 352), (236, 1848), (1420, 1838), (1366, 336)], (1080, 1480), "copertina-cucina")
quad("e41fbb30", [(234, 466), (180, 1596), (1388, 1586), (1302, 456)], (1100, 1040), "copertina-drink")
quad("e41fbb30", [(18, 420), (20, 1640), (212, 1632), (212, 418)], (180, 1100), "trama-drink", enhance=False)
