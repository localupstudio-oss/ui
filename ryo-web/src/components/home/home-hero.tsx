"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Pause, Play } from "lucide-react"

import { ToucanFlight } from "@/components/home/toucan"

/** Foto del locale che si alternano a tutto schermo (al posto del video). */
const slides = [
  { src: "/images/giovedi/microfono-sala.jpg", alt: "La sala di RYO sotto le felci e le lampade in rattan durante una serata" },
  { src: "/images/locale/bancone.jpg", alt: "Il bancone di RYO illuminato tra felci sospese" },
  { src: "/images/giovedi/bottle-service.jpg", alt: "Bottle service sotto il soffitto di felci" },
  { src: "/images/locale/sala-giungla.jpg", alt: "La sala con carta da parati tropicale e tavoli in legno" },
  { src: "/images/galleria/tavola-condivisa.jpg", alt: "Una tavola di piatti da condividere e cocktail" },
]
const INTERVAL = 6500

export function HomeHero() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || reduce) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), INTERVAL)
    return () => clearTimeout(t)
  }, [index, paused, reduce])

  return (
    <section aria-roledescription="carosello" aria-label="Il locale" className="relative isolate h-[100svh] min-h-[620px] overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={slides[index].src}
          className="absolute inset-0 -z-20"
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: reduce ? 1 : 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.8, ease: "easeInOut" }, scale: { duration: INTERVAL / 1000 + 1.8, ease: "linear" } }}
        >
          <Image src={slides[index].src} alt={slides[index].alt} fill priority={index === 0} sizes="100vw" quality={85} className="object-cover" />
        </motion.div>
      </AnimatePresence>
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

      <div className="absolute right-5 bottom-12 hidden items-center gap-3 sm:right-10 sm:flex">
        <div className="flex gap-1.5" role="tablist" aria-label="Scegli foto">
          {slides.map((s, i) => (
            <button
              key={s.src}
              role="tab"
              aria-selected={i === index}
              aria-label={`Foto ${i + 1}`}
              onClick={() => setIndex(i)}
              className="grid h-6 w-7 place-items-center"
            >
              <span className={`block h-px w-full transition-colors ${i === index ? "bg-white" : "bg-white/35"}`} />
            </button>
          ))}
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Riprendi le foto" : "Metti in pausa le foto"}
          className="grid size-9 place-items-center rounded-full text-white/80 transition hover:text-white"
        >
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
        </button>
      </div>
    </section>
  )
}
