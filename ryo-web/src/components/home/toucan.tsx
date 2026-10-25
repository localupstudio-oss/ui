"use client"

import { useEffect } from "react"
import { motion, useAnimate, useReducedMotion } from "framer-motion"

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Il tucano che vola nell'apertura del sito, come la farfalla di Amazónico: entra da
 * sinistra e poi gira di continuo tra punti diversi della hero, ad ali aperte, con
 * battiti morbidi, planate e brevi pause sospese. Disattivato con "riduci movimento".
 */
export function ToucanFlight() {
  const reduce = useReducedMotion()
  const [scope, animate] = useAnimate<HTMLDivElement>()

  useEffect(() => {
    const el = scope.current
    const body = el?.firstElementChild as HTMLElement | null
    if (reduce || !el || !body) return
    let alive = true

    async function fly() {
      const box = () => {
        const host = el.parentElement!
        return { W: host.clientWidth, H: host.clientHeight, s: el.offsetWidth }
      }
      let { W, H } = box()
      let pos = { x: -0.3 * W, y: 0.62 * H }
      await animate(el, { x: pos.x, y: pos.y, opacity: 1 }, { duration: 0 })
      await sleep(900)
      let first = true
      while (alive) {
        ;({ W, H } = box())
        const { s } = box()
        // Punti di sosta in tutta la hero, lontani dall'ultimo, senza uscire dai bordi
        let next = pos
        for (let i = 0; i < 8; i++) {
          next = { x: clamp(rand(0.04, 0.96) * W - s / 2, 12, W - s - 12), y: rand(0.16, 0.6) * H }
          if (Math.hypot(next.x - pos.x, next.y - pos.y) > 0.3 * W) break
        }
        if (first) next = { x: clamp(rand(0.55, 0.7) * W - s / 2, 12, W - s - 12), y: 0.28 * H }
        const dir = next.x < pos.x ? -1 : 1
        const dist = Math.hypot(next.x - pos.x, next.y - pos.y)
        const duration = Math.min(5.5, Math.max(2.6, dist / (0.2 * Math.max(W, 700))))
        const lift = rand(0.06, 0.16) * H
        // arco morbido verso l'alto, senza salire fino al logo
        const mid = { x: (pos.x + next.x) / 2, y: Math.max(0.13 * H, Math.min(pos.y, next.y) - lift) }
        const tilt = Math.max(-14, Math.min(14, ((next.y - pos.y) / H) * 40)) * dir

        animate(body, { scaleX: dir }, { duration: 0.45, ease: "easeInOut" })
        await animate(
          el,
          { x: [pos.x, mid.x, next.x], y: [pos.y, mid.y, next.y], rotate: [0, tilt - 6 * dir, 0] },
          { duration, ease: "easeInOut" },
        )
        pos = next
        first = false
        if (!alive) break
        // Sospeso ad ali aperte: leggero su e giù
        await animate(el, { y: [pos.y, pos.y - rand(8, 16), pos.y] }, { duration: rand(1.4, 2.4), ease: "easeInOut" })
      }
    }
    fly().catch(() => {})
    return () => {
      alive = false
    }
  }, [reduce, animate, scope])

  if (reduce) return null

  return (
    <div ref={scope} aria-hidden className="pointer-events-none absolute top-0 left-0 z-20 w-[130px] opacity-0 sm:w-[220px]">
      <div>
        <ToucanSvg />
      </div>
    </div>
  )
}

function ToucanSvg() {
  // Due battiti e poi planata ad ali spiegate, come un volo vero (non un frullo continuo)
  const cycle = { duration: 1.9, repeat: Infinity, times: [0, 0.14, 0.28, 0.42, 0.56, 1], ease: "easeInOut" as const }
  const flap = { animate: { scaleY: [1, -0.45, 1, -0.45, 1, 1] }, transition: cycle }
  const wingOrigin = { transformOrigin: "122px 104px", transformBox: "view-box" as const }

  return (
    <svg viewBox="0 0 300 200" className="h-auto w-full [filter:drop-shadow(0_0_1.5px_rgb(246_239_224/0.45))_drop-shadow(0_18px_22px_rgb(0_0_0/0.45))]">
      <defs>
        <linearGradient id="beak-top" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#7cc04b" />
          <stop offset="0.28" stopColor="#f6c43a" />
          <stop offset="0.8" stopColor="#f08a23" />
          <stop offset="1" stopColor="#d8342a" />
        </linearGradient>
        <linearGradient id="beak-bottom" x1="0" x2="1">
          <stop offset="0" stopColor="#4f9fd8" />
          <stop offset="0.35" stopColor="#f2a93a" />
          <stop offset="1" stopColor="#c92d24" />
        </linearGradient>
      </defs>

      {/* ala posteriore, sfasata */}
      <motion.path
        d="M126 102 C 118 74, 102 46, 78 24 C 66 13, 52 7, 36 5 C 48 13, 55 20, 59 27 C 50 23, 40 22, 30 24 C 44 30, 53 37, 59 45 C 50 43, 41 44, 33 48 C 48 53, 60 61, 70 72 C 63 72, 56 74, 50 78 C 68 84, 84 96, 98 110 Z"
        transform="translate(-10 -2) rotate(-8 122 104)"
        fill="#050505"
        style={wingOrigin}
        animate={{ scaleY: [0.85, -0.3, 0.85, -0.3, 0.85, 0.85] }}
        transition={cycle}
      />

      {/* coda */}
      <path d="M66 110 L12 96 L10 106 L16 118 L64 124 Z" fill="#0b0b0b" />
      <ellipse cx="74" cy="124" rx="11" ry="5" fill="#d9332b" />
      {/* corpo */}
      <ellipse cx="112" cy="112" rx="56" ry="25" fill="#111" />
      <path d="M100 96 C 120 90, 140 92, 150 100" stroke="#262626" strokeWidth="2" fill="none" />
      {/* petto e gola */}
      <ellipse cx="154" cy="117" rx="19" ry="16" fill="#f4e9c4" />
      <ellipse cx="146" cy="128" rx="11" ry="5" fill="#f2c94c" opacity="0.7" />
      {/* testa */}
      <circle cx="161" cy="104" r="19" fill="#111" />
      <circle cx="167" cy="100" r="6.5" fill="#56b4e9" />
      <circle cx="167.5" cy="100" r="3.2" fill="#050505" />
      <circle cx="168.8" cy="98.8" r="1" fill="#fff" />
      {/* becco */}
      <path d="M175 106 C 214 104, 258 104, 288 111 C 258 119, 212 123, 176 117 Z" fill="url(#beak-bottom)" />
      <path d="M173 92 C 205 79, 256 86, 288 111 C 258 104, 214 103, 175 106 Z" fill="url(#beak-top)" />
      <path d="M176 93 C 208 82, 254 88, 286 110" stroke="#1d1d1d" strokeWidth="1.4" fill="none" opacity="0.45" />
      <path d="M173 91 L181 90 L182 118 L175 117 Z" fill="#111" />

      {/* ala anteriore */}
      <motion.g style={wingOrigin} {...flap}>
        <path d="M126 102 C 118 74, 102 46, 78 24 C 66 13, 52 7, 36 5 C 48 13, 55 20, 59 27 C 50 23, 40 22, 30 24 C 44 30, 53 37, 59 45 C 50 43, 41 44, 33 48 C 48 53, 60 61, 70 72 C 63 72, 56 74, 50 78 C 68 84, 84 96, 98 110 Z" fill="#1a1a1a" />
        {/* penne remiganti */}
        <path d="M118 96 C 104 70, 84 44, 50 16 M112 100 C 96 78, 74 56, 44 36 M106 104 C 90 88, 70 72, 48 60" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </motion.g>
    </svg>
  )
}
