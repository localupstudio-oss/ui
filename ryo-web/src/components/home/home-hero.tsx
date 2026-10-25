"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Pause, Play } from "lucide-react"

import { ToucanFlight } from "@/components/home/toucan"

/**
 * Video di apertura (montaggio in loop di ~25 s, scripts/edit-hero-video.py):
 * orizzontale a tre pannelli per gli schermi larghi, verticale per il telefono.
 * Si vede subito il fotogramma fisso; il video si scarica solo se il movimento è
 * consentito e la connessione non è in risparmio dati.
 */
const VIDEO = {
  desktop: { src: "/video/hero-desktop", poster: "/images/hero/poster-desktop.jpg" },
  mobile: { src: "/video/hero-mobile-v2", poster: "/images/hero/poster-mobile-sala.jpg" },
}

export function HomeHero() {
  const reduce = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)

  // Sceglie il file in base allo schermo e lo collega al <video> solo nel browser.
  useEffect(() => {
    const v = videoRef.current
    if (!v || reduce) return
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (saveData) return
    const wide = window.matchMedia("(min-aspect-ratio: 1/1) and (min-width: 900px)").matches
    // WebM VP9 (più leggero) dove supportato, MP4 H.264 per Safari e iPhone.
    const ext = v.canPlayType('video/webm; codecs="vp9"') ? "webm" : "mp4"
    v.src = `${wide ? VIDEO.desktop.src : VIDEO.mobile.src}.${ext}`
    v.play().catch(() => {})
  }, [reduce])

  function togglePause() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play().catch(() => {})
      setPaused(false)
    } else {
      v.pause()
      setPaused(true)
    }
  }

  return (
    <section aria-label="Benvenuti da RYO" className="relative isolate h-[100svh] min-h-[620px] overflow-hidden bg-black">
      {/* Fotogramma fisso: visibile subito, resta se il video non parte */}
      <Image src={VIDEO.desktop.poster} alt="" fill priority sizes="100vw" className="-z-30 object-cover portrait:hidden" />
      <Image src={VIDEO.mobile.poster} alt="" fill priority sizes="100vw" className="-z-30 object-cover landscape:hidden" />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        onPlaying={() => setPlaying(true)}
        className={`absolute inset-0 -z-20 size-full object-cover transition-opacity duration-[1200ms] ${playing ? "opacity-100" : "opacity-0"}`}
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_50%_50%,rgb(0_0_0/0.15),rgb(0_0_0/0.55))]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-black/50 to-transparent" />

      <ToucanFlight />

      <div className="flex h-full flex-col items-center justify-center px-5 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.3, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[clamp(3.2rem,9vw,7.5rem)] leading-none text-[#f6efe0] [text-shadow:0_4px_40px_rgb(0_0_0/0.35)]"
        >
          Benvenuti da RYO
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1.2 }}
          className="mt-6 text-sm font-medium tracking-[0.3em] text-[#f6efe0] uppercase [text-shadow:0_2px_16px_rgb(0_0_0/0.7)]"
        >
          Cava de&apos; Tirreni
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.9 }} className="absolute inset-x-0 bottom-10 flex justify-center">
        <Link href="#prenota" className="rounded-full bg-[#f6efe0] px-9 py-4 text-[1.05rem] text-ink transition-colors hover:bg-white">
          Prenota un tavolo
        </Link>
      </motion.div>

      {playing && (
        <button
          onClick={togglePause}
          aria-label={paused ? "Riproduci il video" : "Metti in pausa il video"}
          className="absolute right-5 bottom-12 hidden size-10 place-items-center rounded-full text-white/80 transition hover:text-white sm:right-10 sm:grid"
        >
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
        </button>
      )}
    </section>
  )
}
