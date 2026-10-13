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
  { src: "/images/drink/highball-rosa.jpg", alt: "Highball rosa tra foglie tropicali", caption: "I drink" },
] as const

const INTERVAL = 7000

export function Hero() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const { scrollY } = useScroll()
  const yText = useTransform(scrollY, [0, 600], [0, 110])
  const fade = useTransform(scrollY, [0, 500], [1, 0])

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [])

  useEffect(() => {
    if (paused || reduce) return
    const t = setTimeout(next, INTERVAL)
    return () => clearTimeout(t)
  }, [index, paused, reduce, next])

  const slide = slides[index]

  return (
    <section aria-roledescription="carosello" aria-label="Il locale" className="relative isolate h-[100svh] min-h-[660px] overflow-hidden">
      {/* Slider cinematografico: dissolvenza + lento zoom (Ken Burns) */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.src}
          className="absolute inset-0 -z-20"
          initial={{ opacity: 0, scale: 1.16 }}
          animate={{ opacity: 1, scale: reduce ? 1.04 : 1.03 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.6, ease: "easeInOut" }, scale: { duration: INTERVAL / 1000 + 1.6, ease: "linear" } }}
        >
          <Image src={slide.src} alt={slide.alt} fill priority={index === 0} sizes="100vw" quality={85} className="object-cover" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/80 to-background/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-background/60" />
      <div className="jungle-glow absolute inset-0 -z-10" />

      <motion.div style={reduce ? undefined : { y: yText, opacity: fade }} className="mx-auto flex h-full max-w-7xl flex-col justify-center px-5 pt-16 sm:px-8">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="eyebrow">
          {site.claim} — Cava de&apos; Tirreni
        </motion.p>

        <h1 className="sr-only">{site.fullName}</h1>
        <motion.p
          aria-hidden
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 mb-5 font-display text-[clamp(6rem,19vw,13rem)] leading-[0.85]"
        >
          RY<span className="text-hot">O</span>
        </motion.p>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} className="max-w-[34ch] text-lg leading-relaxed text-[#dcd3bf] sm:text-xl">
          Una giungla urbana nel cuore di Cava: cocktail d&apos;autore, cucina da condividere e weekend a ritmo di DJ set.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 px-7">
            <a href="#prenota">Prenota un tavolo</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-7">
            <a href="#drink-list">Scopri i drink</a>
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-9 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.78rem] text-muted-foreground">
          <span><span className="text-leaf">●</span> Aperti dal mercoledì alla domenica</span>
          <span>{site.address.street}</span>
        </motion.div>
      </motion.div>

      {/* Timbro con il logo che ruota */}
      <motion.div
        className="pointer-events-none absolute right-6 bottom-36 hidden w-32 md:block lg:right-16 lg:w-40"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
      >
        <Image src="/images/brand/logo.png" alt="" width={160} height={160} className="drop-shadow-[0_10px_20px_rgb(0_0_0/0.5)]" />
      </motion.div>

      {/* Controlli slider */}
      <div className="absolute right-5 bottom-28 flex items-center gap-4 sm:right-8 md:bottom-24">
        <span className="hidden font-mono text-xs text-foreground/70 sm:block" aria-live="polite">
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
              className="relative h-1 w-9 overflow-hidden rounded-full bg-foreground/25"
            >
              {i === index && (
                <motion.span
                  key={`${index}-${paused}`}
                  className="absolute inset-y-0 left-0 bg-orange"
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
          className="grid size-9 place-items-center rounded-full border border-foreground/25 text-foreground/80 transition hover:border-orange hover:text-orange"
        >
          {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
        </button>
      </div>
    </section>
  )
}
