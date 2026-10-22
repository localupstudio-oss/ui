"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

const STORAGE_KEY = "ryo-toucan-flown"

/**
 * Il tucano che attraversa l'apertura del sito: un solo volo per sessione,
 * disattivato con "riduci movimento". Disegnato in SVG (nessun file esterno).
 */
export function ToucanFlight() {
  const reduce = useReducedMotion()
  const [fly, setFly] = useState(false)

  useEffect(() => {
    if (reduce) return
    let seen = false
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1"
      sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {}
    if (seen) return
    const t = setTimeout(() => setFly(true), 900)
    return () => clearTimeout(t)
  }, [reduce])

  if (!fly) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-20 w-[170px] sm:w-[300px]"
      initial={{ x: "-25vw", y: "70vh", rotate: -14, scale: 0.8 }}
      animate={{
        x: ["-25vw", "18vw", "42vw", "64vw", "112vw"],
        y: ["70vh", "38vh", "30vh", "34vh", "4vh"],
        rotate: [-14, -6, 2, -4, -16],
        scale: [0.8, 1, 1.08, 1.04, 0.9],
      }}
      transition={{ duration: 6.2, times: [0, 0.28, 0.5, 0.7, 1], ease: "easeInOut" }}
      onAnimationComplete={() => setFly(false)}
    >
      <motion.div animate={{ y: [0, -10, 0, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
        <ToucanSvg />
      </motion.div>
    </motion.div>
  )
}

function ToucanSvg() {
  const flap = {
    animate: { scaleY: [1, -0.55, 1] },
    transition: { duration: 0.42, repeat: Infinity, ease: [0.45, 0, 0.55, 1] as const },
  }
  const wingOrigin = { transformOrigin: "122px 104px", transformBox: "view-box" as const }

  return (
    <svg viewBox="0 0 300 200" className="h-auto w-full drop-shadow-[0_18px_22px_rgb(0_0_0/0.45)]">
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
        d="M118 102 C 104 66, 82 38, 52 26 C 66 50, 78 74, 96 106 Z"
        fill="#050505"
        style={wingOrigin}
        animate={{ scaleY: [-0.4, 1, -0.4] }}
        transition={{ duration: 0.42, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
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
        <path d="M124 102 C 108 62, 82 28, 46 14 C 62 42, 78 72, 98 108 Z" fill="#1b1b1b" />
        <path d="M112 92 C 96 66, 80 46, 62 32 M104 98 C 90 76, 76 58, 58 46" stroke="#2f2f2f" strokeWidth="1.6" fill="none" />
      </motion.g>
    </svg>
  )
}
