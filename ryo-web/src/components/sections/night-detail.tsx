"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { ArrowLeft, Clock, MessageCircle, Music2, Ticket } from "lucide-react"

import type { Night } from "@/content/experience"
import { waMessage, whatsappUrl } from "@/content/site"
import { cn } from "@/lib/utils"

const EVERY = 1600

/**
 * Pagina della serata, tutta in una schermata (telefono e PC): a sinistra le foto quadrate che si alternano
 * (o il video della serata, se c'è), a destra il racconto, gli orari e WhatsApp.
 */
export function NightDetail({ night: n }: { night: Night }) {
  const [more, setMore] = useState(false)
  return (
    <section className="pattern-croci flex min-h-[100svh] items-center px-4 pt-[5.25rem] pb-5 sm:px-8 sm:pt-28 lg:pb-8">
      <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 items-center gap-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-14">
        <div className="mx-auto aspect-square w-[min(100%,30svh)] overflow-hidden rounded-sm shadow-2xl min-[400px]:w-[min(100%,34svh)] sm:w-[min(100%,42svh)] lg:w-[min(46vw,calc(100svh-9rem))] [@media(max-height:700px)_and_(max-width:1023px)]:w-[26svh]">
          {n.video ? <Video src={n.video} poster={n.photos[0]?.src} /> : <Slideshow photos={n.photos} />}
        </div>
        <div className="w-full max-w-[560px] max-lg:mx-auto">
          <p className="text-xs tracking-[0.2em] text-amber uppercase sm:text-sm">Ogni {n.day.toLowerCase()}</p>
          <h1 className="mt-1.5 font-display text-[clamp(1.9rem,3.6vw,3.2rem)] leading-tight text-[#f6efe0]">{n.title}</h1>
          {n.about.map((t, k) => (
            <p
              key={t}
              className={cn(
                "mt-3 text-[0.92rem] leading-relaxed text-foreground/75 sm:text-[0.98rem] lg:mt-4",
                k > 0 && !more && "max-lg:hidden",
              )}
            >
              {t}
            </p>
          ))}
          {n.about.length > 1 && !more && (
            <button type="button" onClick={() => setMore(true)} className="mt-2 text-sm text-amber underline underline-offset-4 lg:hidden">
              Continua a leggere
            </button>
          )}
          <dl className="mt-4 grid gap-1.5 text-sm lg:mt-6 lg:gap-2">
            {n.time && <Row icon={Clock} value={n.time} />}
            <Row icon={Music2} value={n.lineup.join(" · ")} />
            {n.entry && <Row icon={Ticket} value={n.entry} />}
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-7">
            <a
              href={whatsappUrl(waMessage.serata(n.title, n.day))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#25d366] px-7 py-3.5 font-medium text-[#062e16] transition-colors hover:bg-[#3ee07a]"
            >
              <MessageCircle className="size-5" /> Prenota su WhatsApp
            </a>
            <Link href="/serate" className="inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-foreground">
              <ArrowLeft className="size-4" /> Tutte le serate
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Il video della serata: parte da solo, senza audio, in loop, ritagliato quadrato. */
function Video({ src, poster }: { src: string; poster?: string }) {
  return <video src={src} poster={poster} autoPlay muted loop playsInline preload="metadata" className="size-full object-cover" />
}

function Slideshow({ photos }: { photos: Night["photos"] }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set())
  const next = (i + 1) % photos.length
  // si passa alla foto successiva solo quando è già caricata: niente riquadri vuoti con la rete lenta
  useEffect(() => {
    if (reduce || photos.length < 2 || !loaded.has(next)) return
    const t = setTimeout(() => setI(next), EVERY)
    return () => clearTimeout(t)
  }, [reduce, photos.length, loaded, next, i])

  return (
    <div className="relative size-full bg-black/30">
      {photos.map((p, k) => {
        // sul foglio restano solo la foto visibile, quella appena uscita (dissolvenza) e la prossima (in caricamento)
        const show = k === i
        if (!show && k !== next && k !== (i - 1 + photos.length) % photos.length) return null
        return (
          <Image
            key={p.src}
            src={p.src}
            alt={show ? p.alt : ""}
            fill
            priority={k === 0}
            quality={85}
            sizes="(min-width:1024px) 46vw, 92vw"
            onLoad={() => setLoaded((s) => (s.has(k) ? s : new Set(s).add(k)))}
            style={{ objectPosition: p.position }}
            className={cn("object-cover transition-opacity duration-500", show ? "opacity-100" : "opacity-0")}
          />
        )
      })}
      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex flex-wrap justify-center gap-1.5 px-6">
          {photos.map((ph, k) => (
            <button
              key={ph.src}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Foto ${k + 1} di ${photos.length}`}
              aria-current={k === i || undefined}
              className={cn("h-1 rounded-full bg-[#f6efe0] shadow transition-all duration-300", k === i ? "w-5" : "w-1 opacity-60")}
            />
          ))}
        </div>
      )}
    </div>
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
