"""Montaggio hero RYO: clip normalizzate 720x1280, gradazione unica, catena di tagli/dissolvenze, loop senza giunte."""
import subprocess, sys, json
from pathlib import Path
X = 0.4  # dissolvenza unica tra tutte le scene
S = Path(__file__).parent; SRC = S / "src"; B = S / "build"; B.mkdir(exist_ok=True)
CROP = {  # w:h:x:y nel verso di visualizzazione (taglia bordi arrotondati, UI di Instagram e scritte)
    "v1": "796:1416:14:14", "v5": "796:1416:14:14", "v2": "796:1416:28:20",
    "v3": "592:1052:130:120", "v4": "806:1433:14:14",
}
# (sorgente, inizio, fine, velocità, transizione verso lo shot successivo: 0 = taglio netto, >0 = dissolvenza)
SHOTS = [
    ("v5", 0.15, 1.25, 0.6, X),   # luce nella foresta
    ("v1", 3.70, 5.20, 0.75, X),  # fiume dall'alto
    ("v1", 0.45, 1.95, 0.75, X),  # cascata
    ("v3", 1.10, 2.05, 0.65, X),  # murale del locale
    ("v4", 0.00, 1.10, 0.7, X),   # jigger
    ("v5", 3.80, 4.80, 0.7, X),   # pappagallo
    ("v4", 7.95, 9.80, 0.9, X),   # fiamma
    ("v3", 2.12, 3.15, 0.7, X),   # sgabelli al bancone
    ("v1", 8.00, 9.20, 0.75, X),  # doppia cascata
    ("v2", 4.10, 5.10, 0.7, X),   # bottigliera
    ("v5", 9.20, 10.05, 0.7, X),  # scimmietta
    ("v4", 6.00, 7.85, 0.9, X),   # legni per l'affumicatura
    ("v3", 3.20, 4.10, 0.7, X),   # ravioli
    ("v1", 9.30, 10.50, 0.75, X), # iguana
    ("v2", 1.05, 1.95, 0.7, X),   # parete in ceramica
    ("v4", 9.90, 11.10, 0.8, X),  # fumo e cloche
    ("v5", 5.70, 6.60, 0.7, X),   # cascata nella giungla
    ("v4", 2.00, 3.50, 0.9, X),   # bitter
    ("v5", 10.60, 11.80, 0.75, X),# foresta dall'alto
    ("v5", 11.85, 12.60, 0.8, X), # drink rosso, dissolve nel primo shot (loop)
]
GRADE = ("eq=contrast=1.05:saturation=0.95:gamma=1.02,"
         "colorbalance=rs=0.02:bs=-0.03:rm=0.03:bm=-0.02:rh=0.03:gh=0.01:bh=-0.04,"
         "unsharp=5:5:0.35:5:5:0,vignette=PI/6")

def render(i, src, a, b, sp):
    out = B / f"s{i:02d}.mp4"
    dur = (b - a) / sp
    vf = [f"crop={CROP[src]}", "scale=720:1280:flags=lanczos", "fps=30"]
    if sp < 1:
        vf.append(f"setpts=PTS/{sp}")
        vf.append("minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" if sp <= 0.72 else "fps=30")
    vf += [GRADE, "format=yuv420p"]
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(a), "-to", str(b), "-i", str(SRC / f"{src}.mov"),
                    "-vf", ",".join(vf), "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-t", f"{dur:.3f}", str(out)], check=True)
    return out, dur

SLOW = 0.93  # porta il loop a ~25 s
clips = [render(i, s[0], s[1], s[2], round(s[3] * SLOW, 3)) for i, s in enumerate(SHOTS)]
# Catena: lo stesso primo shot viene riaggiunto in coda per chiudere il cerchio
items = clips + [clips[0]]
trans = [s[4] for s in SHOTS]
inputs, flt, prev, t = [], [], "0:v", clips[0][1]
for p, _ in items: inputs += ["-i", str(p)]
for k in range(len(items)): flt.append(f"[{k}:v]settb=AVTB,fps=30,setpts=PTS-STARTPTS[i{k}]")
prev = "i0"
for k in range(1, len(items)):
    d = trans[k - 1]
    if d > 0:
        flt.append(f"[{prev}][i{k}]xfade=transition=fade:duration={d}:offset={t - d:.3f}[x{k}]")
        t = t - d + items[k][1]
    else:
        flt.append(f"[{prev}][i{k}]concat=n=2:v=1:a=0[x{k}]")
        t = t + items[k][1]
    prev = f"x{k}"
d_last = trans[-1]
start = d_last                       # il loop parte dove la dissolvenza finale è completa
end = t - items[-1][1] + d_last      # e finisce sullo stesso fotogramma
flt.append(f"[{prev}]trim=start={start:.3f}:end={end:.3f},setpts=PTS-STARTPTS,format=yuv420p[seq]")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(flt), "-map", "[seq]",
                "-c:v", "libx264", "-preset", "slow", "-crf", "12", str(B / "master.mp4")], check=True)
print(json.dumps({"durata": round(end - start, 2)}))
