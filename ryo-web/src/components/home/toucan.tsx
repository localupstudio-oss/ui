"use client"

import { useEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"

type P = { x: number; y: number }
const rand = (a: number, b: number) => a + Math.random() * (b - a)
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

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

/**
 * Il tucano che vola nell'apertura del sito, come la farfalla di Amazónico: entra da sinistra
 * e gira di continuo per la hero su una curva morbida a velocità costante, ad ali aperte.
 * Il movimento è calcolato a ogni fotogramma (requestAnimationFrame) e scritto direttamente
 * come transform: niente ripartenze da fermo, niente ridisegni di React.
 * Si ferma quando la hero non è visibile; disattivato con "riduci movimento".
 */
export function ToucanFlight() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const body = el?.firstElementChild as HTMLElement | null
    const host = el?.parentElement
    if (reduce || !el || !body || !host) return

    // Catena di punti: i primi due fuori schermo a sinistra, così entra in volo
    const pts: P[] = [{ x: -0.45, y: 0.7 }, { x: -0.2, y: 0.58 }, { x: 0.3, y: 0.3 }]
    pts.push(nextWaypoint(pts[2]))
    // Tratto corrente campionato per lunghezza d'arco: si avanza di una distanza fissa
    // a ogni secondo, quindi la velocità resta costante anche nelle curve strette.
    let lut: { p: P; s: number }[] = []
    let dist = 0
    let face = 1, tilt = 0, last = 0, t = 0
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
    build()

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
      last = now
      if (!visible) return
      t += dt
      const W = host.clientWidth
      const speed = Math.max(90, Math.min(190, W * 0.11)) // px al secondo
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
      // virata morbida: la scala orizzontale passa per lo zero come un giro su se stesso
      if (Math.abs(vx) > 0.6) face += (Math.sign(vx) - face) * Math.min(1, dt * 3)
      const targetTilt = clamp((Math.atan2(vy, Math.abs(vx) + 1e-3) * 180) / Math.PI, -16, 16)
      tilt += (targetTilt - tilt) * Math.min(1, dt * 2.5)
      const bob = Math.sin(t * 2.1) * 4
      el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${(p.y + bob).toFixed(1)}px, 0) rotate(${(tilt * Math.sign(face || 1)).toFixed(2)}deg)`
      body.style.transform = `scaleX(${face.toFixed(3)})`
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
    <div ref={ref} aria-hidden className="pointer-events-none absolute top-0 left-0 z-20 w-[150px] opacity-0 will-change-transform sm:w-[260px]">
      <div className="will-change-transform">
        <ToucanSvg />
      </div>
    </div>
  )
}

  // Due battiti e poi planata ad ali spiegate. Le ali "si accorciano" in prospettiva
  // durante il battito (vista da sotto, come nella foto di riferimento).
const cycle = { duration: 1.9, repeat: Infinity, times: [0, 0.14, 0.28, 0.42, 0.56, 1], ease: "easeInOut" as const }
// perno sulla radice dell'ala (bordo sinistro del suo riquadro), per il battito in prospettiva
const wingRoot = { originX: 0, originY: 0.42 }
function Wing({ at, delay = 0 }: { at: string; delay?: number }) {
  return (
    <g transform={at}>
      <motion.g style={wingRoot} animate={{ scaleX: [1, 0.5, 1, 0.5, 1, 1], scaleY: [1, 1.12, 1, 1.12, 1, 1] }} transition={{ ...cycle, delay }} fill="#0c0c0c">
          <path d="M0 -14 C 40 -30, 100 -38, 146 -30 L 144 16 Q 129 32.6 118 20.6 Q 107 35.3 96 23.3 Q 85 37.9 74 25.9 Q 63 40.6 52 28.6 Q 41 43.2 30 31.2 Q 19 45.8 8 33.8 L 0 20 Z" />
          <path d="M0 -5 C 28 -8, 60 -6, 80 0 C 60 4, 28 7, 0 5 Z" transform="translate(128 -26) rotate(-14)" />
          <path d="M0 -5 C 26.8 -8, 57.4 -6, 76.5 0 C 57.4 4, 26.8 7, 0 5 Z" transform="translate(131 -19) rotate(-2)" />
          <path d="M0 -5 C 25.5 -8, 54.8 -6, 73 0 C 54.8 4, 25.5 7, 0 5 Z" transform="translate(134 -12) rotate(10)" />
          <path d="M0 -5 C 24.3 -8, 52.1 -6, 69.5 0 C 52.1 4, 24.3 7, 0 5 Z" transform="translate(137 -5) rotate(22)" />
          <path d="M0 -5 C 23.1 -8, 49.5 -6, 66 0 C 49.5 4, 23.1 7, 0 5 Z" transform="translate(140 2) rotate(34)" />
          <path d="M0 -5 C 21.9 -8, 46.9 -6, 62.5 0 C 46.9 4, 21.9 7, 0 5 Z" transform="translate(143 9) rotate(46)" />
          <path d="M0 -5 C 20.6 -8, 44.2 -6, 59 0 C 44.2 4, 20.6 7, 0 5 Z" transform="translate(146 16) rotate(58)" />
          <path d="M14 -8 C 50 -16, 96 -20, 132 -16 M10 4 C 48 2, 92 0, 128 2" stroke="#2c2c2c" strokeWidth="2" fill="none" strokeLinecap="round" />
      </motion.g>
    </g>
  )
}


function ToucanSvg() {
  return (
    <svg viewBox="0 0 420 320" className="h-auto w-full overflow-visible">
      <defs>
        <linearGradient id="tuc-beak" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0" stopColor="#f6c43a" />
          <stop offset="0.55" stopColor="#f39a26" />
          <stop offset="0.86" stopColor="#e2582a" />
          <stop offset="1" stopColor="#1a1a1a" />
        </linearGradient>
        <radialGradient id="tuc-bib" cx="0.4" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fbf6e6" />
          <stop offset="1" stopColor="#d9d2bd" />
        </radialGradient>
      </defs>

      {/* ala lontana (in basso a destra) e ala vicina (in alto a sinistra), dietro al corpo */}
      <Wing at="translate(200 168) rotate(46) scale(1 1.25)" delay={0.06} />
      <Wing at="translate(196 160) rotate(-136) scale(1 1.25)" />

      {/* coda a ventaglio e sottocoda rossa */}
      <path d="M118 214 C 96 232, 84 252, 92 268 C 108 270, 128 254, 142 232 Z" fill="#0a0a0a" />
      <ellipse cx="146" cy="214" rx="20" ry="13" transform="rotate(-35 146 214)" fill="#d9332b" />
      {/* corpo, in diagonale: testa in alto a destra */}
      <ellipse cx="200" cy="168" rx="74" ry="31" transform="rotate(-35 200 168)" fill="#111" />
      {/* gola bianca e testa */}
      <ellipse cx="246" cy="128" rx="25" ry="20" transform="rotate(-35 246 128)" fill="url(#tuc-bib)" />
      <circle cx="262" cy="108" r="20" fill="#111" />
      <circle cx="268" cy="104" r="6.5" fill="#56b4e9" />
      <circle cx="268.5" cy="104" r="3" fill="#050505" />
      {/* becco */}
      <path d="M272 96 C 300 74, 340 58, 382 50 C 362 66, 320 98, 280 116 Z" fill="url(#tuc-beak)" />
      <path d="M276 100 C 306 82, 344 64, 380 52" stroke="#c0441f" strokeWidth="1.4" fill="none" opacity="0.55" />
      <path d="M270 95 L278 92 L284 115 L277 118 Z" fill="#111" />
    </svg>
  )
}
