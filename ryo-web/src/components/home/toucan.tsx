"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

type P = { x: number; y: number }
const rand = (a: number, b: number) => a + Math.random() * (b - a)
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const smooth = (t: number) => t * t * (3 - 2 * t)

/** Punto su una curva Catmull-Rom (passa per p1 e p2, tangenti morbide date da p0 e p3). */
function catmull(p0: P, p1: P, p2: P, p3: P, t: number): P {
  const t2 = t * t, t3 = t2 * t
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) }
}

/** Nuova meta (in coordinate 0–1 della hero), lontana dall'ultima e fuori dalla zona del logo. */
function nextWaypoint(last: P): P {
  let p = last
  for (let i = 0; i < 10; i++) {
    p = { x: rand(0.06, 0.94), y: rand(0.18, 0.62) }
    if (Math.hypot(p.x - last.x, p.y - last.y) > 0.32) break
  }
  return p
}

/*
 * Volo del tucano: come in natura, una raffica di battiti rapidi e poi una planata
 * ad ali distese. `wing(t)` restituisce l'apertura dell'ala vista di lato:
 * 1 = ala in alto, 0 = di taglio, negativo = sotto il corpo (scorcio prospettico).
 */
const FLAP = 0.34 // s per battito
const FLAPS = 3
const GLIDE = 1.15 // s di planata
const CYCLE = FLAP * FLAPS + GLIDE
const GLIDE_POSE = 0.55
function wing(t: number) {
  const c = ((t % CYCLE) + CYCLE) % CYCLE
  if (c < FLAP * FLAPS) {
    const w = 0.5 + 0.5 * Math.cos((2 * Math.PI * c) / FLAP) // 1 su → 0 giù → 1 su
    return { s: -0.72 + 1.72 * w, beating: 1 }
  }
  // planata: scende dolcemente in posa distesa e risale prima della raffica successiva
  const g = (c - FLAP * FLAPS) / GLIDE
  const k = g < 0.25 ? smooth(g / 0.25) : g > 0.8 ? smooth((1 - g) / 0.2) : 1
  return { s: 1 + (GLIDE_POSE - 1) * k + Math.sin(g * Math.PI * 2) * 0.03 * k, beating: 1 - k }
}

/**
 * Il tucano che vola nell'apertura del sito, come la farfalla di Amazónico: entra da sinistra
 * e gira di continuo per la hero su una curva morbida. Tutto è calcolato a ogni fotogramma
 * (requestAnimationFrame) e scritto direttamente nei transform: traiettoria, battito d'ali
 * con le penne che si aprono, leggero sobbalzo a ogni colpo d'ala, virata in 3D quando cambia
 * direzione. Si ferma quando la hero non è visibile; disattivato con "riduci movimento".
 */
export function ToucanFlight() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const body = el?.firstElementChild as HTMLElement | null
    const host = el?.parentElement
    if (reduce || !el || !body || !host) return
    const near = body.querySelector<SVGGElement>("[data-wing=near]")
    const far = body.querySelector<SVGGElement>("[data-wing=far]")
    const nearFeathers = [...body.querySelectorAll<SVGPathElement>("[data-wing=near] [data-feather]")]
    const farFeathers = [...body.querySelectorAll<SVGPathElement>("[data-wing=far] [data-feather]")]
    const tail = body.querySelector<SVGGElement>("[data-tail]")

    const pts: P[] = [{ x: -0.45, y: 0.7 }, { x: -0.2, y: 0.58 }, { x: 0.3, y: 0.3 }]
    pts.push(nextWaypoint(pts[2]))
    // tratto corrente campionato per lunghezza d'arco → velocità uniforme anche in curva
    let lut: { p: P; s: number }[] = []
    let dist = 0, face = 1, tilt = 0, bank = 0, last = 0, t = 0
    let raf = 0, visible = true, started = false

    const build = () => {
      const W = host.clientWidth, H = host.clientHeight, half = el.offsetWidth / 2
      const [a, b, c, d] = pts.map((q) => ({ x: q.x * W - half, y: q.y * H }))
      lut = []
      let acc = 0, prev = b
      for (let i = 0; i <= 48; i++) {
        const q = catmull(a, b, c, d, i / 48)
        acc += Math.hypot(q.x - prev.x, q.y - prev.y)
        lut.push({ p: q, s: acc })
        prev = q
      }
    }
    const at = (sd: number) => {
      let i = 1
      while (i < lut.length - 1 && lut[i].s < sd) i++
      const A = lut[i - 1], B = lut[i], k = B.s > A.s ? (sd - A.s) / (B.s - A.s) : 0
      return { x: A.p.x + (B.p.x - A.p.x) * k, y: A.p.y + (B.p.y - A.p.y) * k }
    }
    const setWing = (g: SVGGElement | null, feathers: SVGPathElement[], s: number, sx: number, sy: number, sweep: number) => {
      if (!g) return
      g.setAttribute("transform", `translate(${sx} ${sy}) rotate(${sweep}) scale(1 ${s.toFixed(3)}) translate(${-sx} ${-sy})`)
      // in battuta le remiganti si aprono a ventaglio, in risalita si richiudono
      const spread = (1 - s) * 0.5
      feathers.forEach((f, i) => f.setAttribute("transform", `rotate(${(i * 3.2 * spread).toFixed(2)} ${f.dataset.ox} ${f.dataset.oy})`))
    }
    build()

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
      last = now
      if (!visible) return
      t += dt
      const W = host.clientWidth
      const w = wing(t), wf = wing(t - 0.045)
      // spinta: un po' più veloce durante i battiti, rallenta in planata
      const speed = Math.max(90, Math.min(190, W * 0.11)) * (0.88 + 0.2 * w.beating)
      dist += speed * dt
      while (dist >= lut[lut.length - 1].s) {
        dist -= lut[lut.length - 1].s
        pts.shift()
        pts.push(nextWaypoint(pts[pts.length - 1]))
        build()
      }
      const p = at(dist)
      const q = at(Math.min(lut[lut.length - 1].s, dist + 6))
      const vx = q.x - p.x, vy = q.y - p.y
      // virata: rotazione 3D sull'asse verticale, con inclinazione d'ala durante il giro
      const prevFace = face
      if (Math.abs(vx) > 0.6) face += (Math.sign(vx) - face) * Math.min(1, dt * 2.4)
      const turnRate = (face - prevFace) / Math.max(dt, 1e-3)
      bank += (clamp(turnRate * 14, -28, 28) - bank) * Math.min(1, dt * 4)
      const targetTilt = clamp((Math.atan2(vy, Math.abs(vx) + 1e-3) * 180) / Math.PI, -18, 18)
      tilt += (targetTilt - tilt) * Math.min(1, dt * 2.5)
      // il corpo sale a ogni battuta e scende piano in planata
      const lift = -4 * (1 - w.s) * w.beating + Math.sin(t * 1.7) * 3
      const yaw = ((1 - face) / 2) * 180
      el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${(p.y + lift).toFixed(1)}px, 0)`
      body.style.transform = `perspective(900px) rotateY(${yaw.toFixed(1)}deg) rotateX(${bank.toFixed(1)}deg) rotate(${tilt.toFixed(2)}deg)`
      setWing(near, nearFeathers, w.s, 176, 112, -18)
      setWing(far, farFeathers, wf.s * 0.92, 190, 106, -10)
      tail?.setAttribute("transform", `rotate(${(Math.sin(t * 2.3) * 2 + (1 - w.s) * 2).toFixed(2)} 118 132)`)
      if (!started) {
        started = true
        el.style.opacity = "1"
      }
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      last = 0
    })
    io.observe(host)
    const start = setTimeout(() => (raf = requestAnimationFrame(frame)), 900)
    return () => {
      clearTimeout(start)
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [reduce])

  if (reduce) return null

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute top-0 left-0 z-20 w-[150px] opacity-0 will-change-transform sm:w-[250px]">
      <div className="will-change-transform">
        <ToucanSvg />
      </div>
    </div>
  )
}

/* ───────────────────────── Disegno (vista di lato, verso destra) ───────────────────────── */

/** Ala in coordinate locali: spalla in (sx, sy), ala distesa verso l'alto e all'indietro. */
function WingShape({ sx, sy, dark }: { sx: number; sy: number; dark?: boolean }) {
  // remiganti primarie: lunghe, a ventaglio verso la punta
  const primaries = Array.from({ length: 7 }, (_, i) => {
    const bx = sx - 18 + i * 5, by = sy - 98 + i * 6
    const len = 78 - i * 6, ang = -26 + i * 9
    const rad = (ang * Math.PI) / 180
    const tx = bx + Math.sin(rad) * len, ty = by - Math.cos(rad) * len
    const nx = Math.cos(rad) * 6, ny = Math.sin(rad) * 6
    const mx = (bx + tx) / 2, my = (by + ty) / 2
    return {
      d: `M${bx - nx} ${by - ny} Q ${mx - nx * 1.3} ${my - ny * 1.3} ${tx} ${ty} Q ${mx + nx * 1.3} ${my + ny * 1.3} ${bx + nx} ${by + ny} Z`,
      ox: bx,
      oy: by,
    }
  })
  // secondarie: bordo d'uscita verso la coda
  const secondaries = Array.from({ length: 6 }, (_, i) => {
    const bx = sx - 26 - i * 9, by = sy - 74 + i * 13
    return `M${bx + 10} ${by - 4} Q ${bx - 22} ${by - 8} ${bx - 34} ${by + 6} Q ${bx - 16} ${by + 10} ${bx + 10} ${by + 8} Z`
  })
  return (
    <>
      {secondaries.map((d, i) => (
        <path key={`s${i}`} d={d} fill={dark ? "#070707" : "#0e0e0e"} stroke={dark ? "#262626" : "#f6efe0"} strokeOpacity={dark ? 1 : 0.22} strokeWidth="0.9" />
      ))}
      {primaries.map((f, i) => (
        <path key={`p${i}`} data-feather="" data-ox={f.ox} data-oy={f.oy} d={f.d} fill={dark ? "#060606" : "#101010"} stroke={dark ? "#2c2c2c" : "#f6efe0"} strokeOpacity={dark ? 1 : 0.28} strokeWidth="0.9" />
      ))}
      {/* copritrici */}
      <path
        d={`M${sx + 6} ${sy + 4} C ${sx - 10} ${sy - 30}, ${sx - 30} ${sy - 72}, ${sx - 24} ${sy - 104} C ${sx - 4} ${sy - 96}, ${sx + 18} ${sy - 60}, ${sx + 20} ${sy - 6} Z`}
        fill={dark ? "#050505" : "url(#tuc-wing)"}
      />
      <path d={`M${sx + 2} ${sy - 18} C ${sx - 8} ${sy - 44}, ${sx - 18} ${sy - 70}, ${sx - 18} ${sy - 92}`} stroke="#303030" strokeWidth="1.2" fill="none" opacity="0.7" />
    </>
  )
}

function ToucanSvg() {
  return (
    <svg viewBox="0 0 400 230" className="h-auto w-full overflow-visible">
      <defs>
        <radialGradient id="tuc-body" cx="0.6" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#2b2b2b" />
          <stop offset="0.55" stopColor="#111" />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>
        <linearGradient id="tuc-wing" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0" stopColor="#222" />
          <stop offset="1" stopColor="#0b0b0b" />
        </linearGradient>
        <radialGradient id="tuc-bib" cx="0.45" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fffdf2" />
          <stop offset="0.7" stopColor="#f7efcf" />
          <stop offset="1" stopColor="#efd27a" />
        </radialGradient>
        <linearGradient id="tuc-upper" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#f2a12a" />
          <stop offset="0.45" stopColor="#f7b733" />
          <stop offset="0.78" stopColor="#f08a1c" />
          <stop offset="0.9" stopColor="#d8561b" />
          <stop offset="0.93" stopColor="#141414" />
          <stop offset="1" stopColor="#0d0d0d" />
        </linearGradient>
        <linearGradient id="tuc-lower" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#e9762a" />
          <stop offset="0.7" stopColor="#e3561f" />
          <stop offset="0.9" stopColor="#141414" />
        </linearGradient>
        <linearGradient id="tuc-shine" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ala lontana, dietro al corpo */}
      <g data-wing="far">
        <WingShape sx={190} sy={106} dark />
      </g>

      {/* coda */}
      <g data-tail="">
        <path d="M120 120 C 92 116, 52 116, 20 124 C 22 132, 26 138, 30 142 C 60 140, 96 142, 124 146 Z" fill="#0a0a0a" stroke="#f6efe0" strokeOpacity="0.32" strokeWidth="1.4" />
        <path d="M118 128 C 88 126, 56 128, 26 133" stroke="#252525" strokeWidth="1.2" fill="none" />
      </g>
      {/* sottocoda rossa */}
      <ellipse cx="128" cy="146" rx="20" ry="9" transform="rotate(-12 128 146)" fill="#c8241f" />
      <ellipse cx="124" cy="144" rx="10" ry="4" transform="rotate(-12 124 144)" fill="#e2463a" opacity="0.6" />

      {/* corpo */}
      <path d="M118 126 C 132 98, 190 88, 238 98 C 262 104, 272 124, 262 142 C 246 160, 182 164, 140 154 C 122 150, 112 140, 118 126 Z" fill="url(#tuc-body)" stroke="#f6efe0" strokeOpacity="0.32" strokeWidth="1.4" />
      {/* zampe raccolte */}
      <path d="M170 158 q 6 8 14 6 M186 158 q 6 8 14 6" stroke="#5b6c8a" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* gola bianca con bordo giallo */}
      <path d="M244 100 C 262 98, 276 110, 274 126 C 272 140, 258 148, 244 144 C 238 132, 236 112, 244 100 Z" fill="url(#tuc-bib)" />
      <path d="M244 144 C 252 148, 262 146, 268 140" stroke="#d8352c" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* testa */}
      <path d="M240 98 C 244 78, 270 72, 284 84 C 292 92, 292 104, 286 110 C 276 106, 258 102, 240 98 Z" fill="url(#tuc-body)" stroke="#f6efe0" strokeOpacity="0.32" strokeWidth="1.4" />
      {/* pelle nuda attorno all'occhio: arancio con anello azzurro */}
      <ellipse cx="275" cy="90" rx="10" ry="8.5" fill="#f08a24" />
      <circle cx="276" cy="90" r="5.6" fill="#3aa4dc" />
      <circle cx="276.4" cy="90" r="3.2" fill="#050505" />
      <circle cx="277.6" cy="88.8" r="1.1" fill="#fff" />

      {/* becco */}
      <path d="M284 84 C 318 74, 366 80, 396 104 C 392 108, 386 110, 380 110 C 350 102, 314 100, 288 104 Z" fill="url(#tuc-upper)" />
      <path d="M288 104 C 316 100, 350 102, 380 110 C 372 116, 340 120, 290 116 Z" fill="url(#tuc-lower)" />
      <path d="M286 86 C 320 78, 362 84, 392 104" stroke="url(#tuc-shine)" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M289 105 C 318 101, 352 103, 382 110" stroke="#7a2a10" strokeWidth="1.1" fill="none" opacity="0.6" />
      {/* base del becco */}
      <path d="M282 84 C 286 92, 288 106, 290 116 L 284 116 C 282 104, 280 94, 278 86 Z" fill="#101010" />

      {/* ala vicina, davanti al corpo */}
      <g data-wing="near">
        <WingShape sx={176} sy={112} />
      </g>
    </svg>
  )
}
