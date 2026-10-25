"""Montaggio verticale per il telefono: scene a tutto schermo alternate a schermi doppi e tripli
che entrano scorrendo, dissolvenze e scorrimenti morbidi, loop senza giunte (~25 s).
Usa le clip già normalizzate e gradate da edit.py (build/sNN.mp4, 720x1280)."""
import subprocess, json
from pathlib import Path
S = Path(__file__).parent; B = S / "build"; G = B / "mob"; G.mkdir(exist_ok=True)
BG = "0x0b0f0c"; W, H = 720, 1280; GAP = 4
SPLIT_D = 3.0   # durata di uno schermo doppio/triplo
IN = 0.55       # durata dello scorrimento d'ingresso dei pannelli

def dur(p): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))
def run(args): subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *args], check=True)
ENC = ["-an", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", "-r", "30"]

def full(k, s):
    out = G / f"seg{k:02d}.mp4"; run(["-i", str(B / f"s{s:02d}.mp4"), *ENC, str(out)]); return out

def split(k, shots, ys=None):
    """Pannelli orizzontali impilati: entrano da sinistra/destra alternati, sfalsati di 0,12 s."""
    n = len(shots); ph = (H - GAP * (n - 1)) // n; ys = ys or [0.5] * n
    args = ["-f", "lavfi", "-i", f"color=c={BG}:s={W}x{H}:r=30:d={SPLIT_D}"]
    flt = []
    for i, s in enumerate(shots):
        src = B / f"s{s:02d}.mp4"; stretch = max(1.0, SPLIT_D / dur(src))
        args += ["-i", str(src)]
        flt.append(f"[{i+1}:v]setpts=PTS*{stretch:.4f},fps=30,crop={W}:{ph}:0:(ih-{ph})*{ys[i]},trim=duration={SPLIT_D},setpts=PTS-STARTPTS[p{i}]")
    prev = "0:v"
    for i in range(n):
        d = 0.12 * i; sign = -1 if i % 2 == 0 else 1
        x = f"{sign}*{W}*pow(max(0\\,1-max(0\\,t-{d})/{IN})\\,3)"
        flt.append(f"[{prev}][p{i}]overlay=x='{x}':y={i*(ph+GAP)}:eval=frame:shortest=0[o{i}]")
        prev = f"o{i}"
    flt.append(f"[{prev}]trim=duration={SPLIT_D},format=yuv420p[v]")
    out = G / f"seg{k:02d}.mp4"
    run([*args, "-filter_complex", ";".join(flt), "-map", "[v]", *ENC, str(out)]); return out

# Struttura: (tipo, shot, transizione verso il segmento successivo)
PLAN = [
    ("F", 0, ("fade", 0.5)),                    # luce nella foresta
    ("F", 1, ("fade", 0.3)),                    # fiume dall'alto
    ("S", [2, 16], ("smoothup", 0.5)),          # cascata | cascata nella giungla
    ("F", 3, ("fade", 0.3)),                    # murale del locale
    ("S", [4, 11], ("smoothleft", 0.5)),        # jigger | legni affumicatura
    ("F", 6, ("fade", 0.3)),                    # fiamma
    ("S3", [5, 10, 13], ("smoothup", 0.5)),     # pappagallo | scimmietta | iguana
    ("F", 7, ("fade", 0.3)),                    # sgabelli al bancone
    ("S", [9, 14], ("smoothright", 0.5)),       # bottigliera | parete in ceramica
    ("F", 15, ("fade", 0.3)),                   # fumo e cloche
    ("S", [12, 17], ("smoothup", 0.5)),         # ravioli | bitter
    ("F", 8, ("fade", 0.3)),                    # doppia cascata
    ("S", [18, 19], ("fade", 0.6)),             # foresta dall'alto | drink rosso → loop
]
YS = {6: [0.6, 0.45, 0.4], 10: [0.5, 0.9]}  # inquadratura verticale dei pannelli (0 = alto, 1 = basso)
segs = []
for k, (kind, s, _) in enumerate(PLAN):
    segs.append(full(k, s) if kind == "F" else split(k, s, YS.get(k)))
durs = [dur(p) for p in segs]
items = segs + [segs[0]]; idur = durs + [durs[0]]
inputs, flt = [], []
for p in items: inputs += ["-i", str(p)]
for k in range(len(items)): flt.append(f"[{k}:v]settb=AVTB,fps=30,setpts=PTS-STARTPTS[i{k}]")
prev, t = "i0", idur[0]
for k in range(1, len(items)):
    tr, d = PLAN[k - 1][2]
    flt.append(f"[{prev}][i{k}]xfade=transition={tr}:duration={d}:offset={t - d:.3f}[x{k}]")
    t = t - d + idur[k]; prev = f"x{k}"
d_last = PLAN[-1][2][1]
start, end = d_last, t - idur[-1] + d_last
flt.append(f"[{prev}]trim=start={start:.3f}:end={end:.3f},setpts=PTS-STARTPTS,format=yuv420p[v]")
run([*inputs, "-filter_complex", ";".join(flt), "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "12", str(B / "master-mobile.mp4")])
print(json.dumps({"durata": round(end - start, 2)}))
