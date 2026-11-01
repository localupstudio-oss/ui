"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, Clock, MessageCircle, Music2, Ticket } from "lucide-react"

import type { Night } from "@/content/experience"
import { waMessage, whatsappUrl } from "@/content/site"
import { cn } from "@/lib/utils"

const EVERY = 4500

/** Pagina della serata: foto che si alternano da un lato, racconto breve e WhatsApp dall'altro. */
export function NightDetail({ night: n }: { night: Night }) {
  return (
    <section className="pattern-croci grid grid-cols-1 lg:min-h-[100svh] lg:grid-cols-2">
      <Slideshow photos={n.photos} />
      <div className="flex items-center justify-center px-5 pt-12 pb-16 sm:px-10 lg:pt-32 lg:pb-20">
        <div className="w-full max-w-[520px]">
          <p className="text-sm tracking-[0.2em] text-amber uppercase">Ogni {n.day.toLowerCase()}</p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,4.4vw,3.6rem)] leading-tight text-[#f6efe0]">{n.title}</h1>
          {n.about.map((t) => (
            <p key={t} className="mt-5 text-[1.05rem] leading-relaxed text-foreground/75">
              {t}
            </p>
          ))}
          {n.stickers && <Stickers items={n.stickers} />}
          <dl className="mt-8 grid gap-2.5 text-sm">
            {n.time && <Row icon={Clock} value={n.time} />}
            <Row icon={Music2} value={n.lineup.join(" · ")} />
            {n.entry && <Row icon={Ticket} value={n.entry} />}
          </dl>
          <a
            href={whatsappUrl(waMessage.serata(n.title, n.day))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-[#25d366] px-8 py-4 font-medium text-[#062e16] transition-colors hover:bg-[#3ee07a]"
          >
            <MessageCircle className="size-5" /> Prenota su WhatsApp
          </a>
          <p className="mt-10">
            <Link href="/serate" className="inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-foreground">
              <ArrowLeft className="size-4" /> Tutte le serate
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

function Slideshow({ photos }: { photos: Night["photos"] }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduce || photos.length < 2) return
    const t = setInterval(() => setI((v) => (v + 1) % photos.length), EVERY)
    return () => clearInterval(t)
  }, [reduce, photos.length])
  const p = photos[i]

  return (
    <div className="relative h-[52svh] overflow-hidden lg:h-auto">
      <AnimatePresence initial={false}>
        <motion.div
          key={p.src}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.1 }, scale: { duration: EVERY / 1000 + 1.1, ease: "linear" } }}
        >
          <Image src={p.src} alt={p.alt} fill priority={i === 0} sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
          {photos.map((ph, k) => (
            <button
              key={ph.src}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Foto ${k + 1} di ${photos.length}`}
              aria-current={k === i || undefined}
              className={cn("h-1.5 rounded-full bg-[#f6efe0] transition-all duration-500", k === i ? "w-7" : "w-1.5 opacity-60")}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Colori degli sticker veri della serata: rosso, verde, arancio, blu.
const STICKER = ["text-[#d4202b]", "text-[#0f8a5a]", "text-[#e8742a]", "text-[#2a8fd8]"]
const TILT = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"]

/** Le frasi degli sticker sul tavolo, come piccoli adesivi bianchi un po' storti. */
function Stickers({ items }: { items: string[] }) {
  return (
    <ul aria-label="Gli sticker della serata" className="mt-6 flex flex-wrap gap-2.5">
      {items.map((t, i) => (
        <li
          key={t}
          className={cn(
            "rounded-md bg-[#f6efe0] px-3 py-1.5 font-sans text-[0.72rem] font-extrabold leading-tight tracking-wide uppercase shadow-[0_2px_6px_rgb(0_0_0/0.35)]",
            STICKER[i % STICKER.length],
            TILT[(i * 3) % TILT.length],
          )}
        >
          {t}
        </li>
      ))}
    </ul>
  )
}

function Row({ icon: Icon, value }: { icon: typeof Clock; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
      <dd className="text-foreground/90">{value}</dd>
    </div>
  )
}
