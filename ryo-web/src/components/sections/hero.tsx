"use client"

import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { Pause, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { site } from "@/content/site"

const slides = [
  { src: "/images/locale/bancone.jpg", alt: "Il bancone di RYO illuminato tra felci sospese e lampade in rattan", caption: "Il bancone" },
  { src: "/images/locale/sala-giungla.jpg", alt: "La sala di RYO con tavoli in legno e carta da parati tropicale", caption: "La sala" },
  { src: "/images/galleria/tavola-condivisa.jpg", alt: "Tavola imbandita con paella, crudi e cocktail rosa", caption: "La cucina" },
  { src: "/images/drink/highball-rosa.jpg", alt: "Highball rosa tra foglie tropicali", caption: "La mixology" },
] as const

const INTERVAL = 7000

export function Hero() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const { scrollY } = useScroll()
  const yText = useTransform(scrollY, [0, 600], [0, 120])
  const fade = useTransform(scrollY, [0, 500], [1, 0])

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [])

  useEffect(() => {
    if (paused || reduce) return
    const t = setTimeout(next, INTERVAL)
    return () => clearTimeout(t)
  }, [index, paused, reduce, next])

  const slide = slides[index]

  return (
    <section aria-roledescription="carosello" aria-label="Il locale" className="relative isolate h-[100svh] min-h-[640px] overflow-hidden">
      {/* Slider cinematografico: crossfade + Ken Burns */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.src}
          className="absolute inset-0 -z-20"
          initial={{ opacity: 0, scale: 1.18, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: reduce ? 1.05 : 1.04, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ opacity: { duration: 1.6, ease: "easeInOut" }, filter: { duration: 1.6 }, scale: { duration: INTERVAL / 1000 + 1.6, ease: "linear" } }}
        >
          <Image src={slide.src} alt={slide.alt} fill priority={index === 0} sizes="100vw" quality={85} className="object-cover" />
        </motion.div>
      </AnimatePresence>

      {/* Overlay: vignettatura calda + gradiente verso il fondo */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_30%,transparent_20%,rgb(7_13_10/0.75)_75%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/20 to-background" />

      <motion.div style={reduce ? undefined : { y: yText, opacity: fade }} className="mx-auto flex h-full max-w-7xl flex-col justify-center px-5 pt-20 sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="flex items-center gap-3 text-xs font-semibold tracking-[0.4em] text-brass-light uppercase"
        >
          <span className="h-px w-10 bg-brass" />
          {site.claim} · Cava de&apos; Tirreni
        </motion.p>

        <h1 className="mt-6 max-w-4xl font-display text-[clamp(3.2rem,9vw,7.5rem)] leading-[0.95] font-medium text-balance">
          {["L'arte del drink,", "nel cuore della giungla."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-2">
              <motion.span
                className={i === 1 ? "block text-brass-gradient italic" : "block"}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.45 + i * 0.15, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/80"
        >
          Mixology d&apos;autore, cucina da condividere e serate esclusive tra felci, ottone e luci calde.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.8 }} className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 rounded-full px-7 text-base font-semibold">
            <a href="#prenota">Prenota un Tavolo</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-foreground/30 bg-transparent px-7 text-base backdrop-blur hover:bg-foreground/10">
            <a href="#mixology-lab">Esplora il Mixology Lab</a>
          </Button>
        </motion.div>
      </motion.div>

      {/* Controlli slider */}
      <div className="absolute right-5 bottom-28 flex items-center gap-4 sm:right-8 sm:bottom-32">
        <span className="hidden font-display text-lg text-foreground/70 italic sm:block" aria-live="polite">
          {String(index + 1).padStart(2, "0")} — {slide.caption}
        </span>
        <div className="flex gap-2" role="tablist" aria-label="Seleziona immagine">
          {slides.map((s, i) => (
            <button
              key={s.src}
              role="tab"
              aria-selected={i === index}
              aria-label={`Immagine ${i + 1}: ${s.caption}`}
              onClick={() => setIndex(i)}
              className="relative h-1 w-10 overflow-hidden rounded-full bg-foreground/25"
            >
              {i === index && (
                <motion.span
                  key={`${index}-${paused}`}
                  className="absolute inset-y-0 left-0 bg-brass"
                  initial={{ width: paused || reduce ? "100%" : "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: paused || reduce ? 0 : INTERVAL / 1000, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Riprendi lo slideshow" : "Metti in pausa lo slideshow"}
          className="grid size-9 place-items-center rounded-full border border-foreground/25 text-foreground/80 transition hover:border-brass hover:text-brass"
        >
          {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
        </button>
      </div>

    </section>
  )
}
