"""
Video in loop della serata T'immagini (venerdì): le foto della serata montate a ritmo veloce, con zoom e
piccoli movimenti di camera e dissolvenze brevi. 4:5 (864 × 1080), come la metà schermo della pagina.

  python3 scripts/video-timmagini.py   (scrive public/video/timmagini.mp4, .webm e la locandina .jpg)
"""
import re
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "video" / "timmagini.mp4"
W, H, FPS = 864, 1080, 25  # 4:5, nitido anche sugli schermi retina a metà pagina
HOLD, FADE = 1.55, 0.25  # secondi per foto e durata della dissolvenza


def photos():
    """Le foto del venerdì dall'elenco del sito, con il punto da tenere al centro; il neon apre il video."""
    src = (ROOT / "src" / "content" / "experience.ts").read_text()
    block = src[src.index('slug: "venerdi"'):]
    block = block[block.index("photos: ["):]
    block = block[:block.index("],")]
    items = re.findall(r'src: "([^"]+)"[^}]*?position: "(\d+)% (\d+)%"', block)
    out = [("/images/serate/venerdi/neon-timmagini-copertina.jpg", 55, 45)]
    out += [(f, int(x), int(y)) for f, x, y in items if "neon-timmagini" not in f and "qr-canzoni" not in f]
    out.append(("/images/serate/venerdi/qr-canzoni.jpg", 50, 50))  # chiude con il QR, poi il loop riparte dal neon
    return out


def base(path, fx, fy):
    """Ritaglio 4:5 attorno al punto scelto, un po' più grande del fotogramma per lasciare spazio al movimento."""
    im = Image.open(ROOT / "public" / path.lstrip("/")).convert("RGB")
    w, h = im.size
    tw, th = (w, round(w * 5 / 4)) if w * 5 / 4 <= h else (round(h * 4 / 5), h)
    x = round((w - tw) * fx / 100)
    y = round((h - th) * fy / 100)
    im = im.crop((x, y, x + tw, y + th)).resize((round(W * 1.12), round(H * 1.12)), Image.LANCZOS)
    im = ImageEnhance.Contrast(im).enhance(1.05)
    return ImageEnhance.Color(im).enhance(1.06)


def frames(im, n, k):
    """Zoom lento (dentro o fuori, alternati) con un piccolo spostamento laterale."""
    bw, bh = im.size
    for t in range(n):
        p = t / max(n - 1, 1)
        z = 1.0 + 0.10 * (p if k % 2 == 0 else 1 - p)  # da 1 a 1,1 o viceversa
        cw, ch = bw / z, bh / z
        dx = (bw - cw) * (0.5 + (0.25 if k % 3 == 0 else -0.25) * (p - 0.5))
        dy = (bh - ch) * 0.5
        yield np.asarray(im.resize((W, H), Image.BILINEAR, box=(dx, dy, dx + cw, dy + ch)))


def main():
    items = photos()
    hold, fade = round(HOLD * FPS), round(FADE * FPS)
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", str(OUT)],
        stdin=subprocess.PIPE,
    )
    prev_tail = None
    for k, (path, fx, fy) in enumerate(items):
        clip = list(frames(base(path, fx, fy), hold + fade, k))
        if prev_tail is not None:  # dissolvenza dalla coda della foto precedente
            for j in range(fade):
                a = (j + 1) / (fade + 1)
                ff.stdin.write((prev_tail[j] * (1 - a) + clip[j] * a).astype(np.uint8).tobytes())
            body = clip[fade:hold]
        else:
            body = clip[:hold]
        for f in body:
            ff.stdin.write(f.tobytes())
        prev_tail = [c.astype(np.float32) for c in clip[hold:hold + fade]]
        if k == 0:
            Image.fromarray(clip[0]).save(OUT.with_suffix(".jpg"), quality=86)
    for f in prev_tail:  # l'ultima foto finisce intera: al ritorno del loop riparte il neon
        ff.stdin.write(f.astype(np.uint8).tobytes())
    ff.stdin.close()
    ff.wait()
    # anche in WebM (VP9): i browser senza H.264 lo usano al posto dell'mp4
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(OUT), "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38",
                    "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", "-an", str(OUT.with_suffix(".webm"))], check=True)
    print("creato", OUT, len(items), "foto")


if __name__ == "__main__":
    main()
