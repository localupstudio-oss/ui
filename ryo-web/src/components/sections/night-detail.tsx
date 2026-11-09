"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

import type { Night } from "@/content/experience"
import { waMessage, whatsappUrl } from "@/content/site"
import { cn } from "@/lib/utils"

const EVERY = 1600

/**
 * Pagina della serata, tutta in una schermata: metà con le foto (o il video della serata), metà con il racconto.
 * Titolo maiuscolo in serif con l'orario sotto, frase di lancio in grassetto, testo ampio, pulsante a contorno.
 */
export function NightDetail({ night: n }: { night: Night }) {
  const [more, setMore] = useState(false)
  return (
    <section className="pattern-croci grid min-h-[100svh] grid-cols-1 grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-1">
      <div className="relative h-[30svh] min-[400px]:h-[36svh] lg:h-auto lg:min-h-[100svh]">
        {n.video ? <Video src={n.video} poster={n.photos[0]?.src} /> : <Slideshow photos={n.photos} />}
      </div>
      <div className="flex items-start px-6 pt-5 pb-6 sm:px-12 lg:items-center lg:px-[clamp(3rem,6vw,7rem)] lg:pt-24 lg:pb-10">
        <div className="w-full max-w-[540px]">
          <h1 className="font-display text-[clamp(1.45rem,2.3vw,2.2rem)] leading-[1.18] tracking-[0.01em] text-[#f6efe0] uppercase">
            {n.title}
            {n.time && (
              <>
                <br />
                <span className="normal-case">Ogni {n.day.toLowerCase()} · {n.time.replace("Start ", "dalle ")}</span>
              </>
            )}
          </h1>
          <p className="mt-3 text-[0.95rem] leading-snug font-semibold text-[#f6efe0]/80 sm:text-[1.02rem] lg:mt-4">{n.mood}</p>
          {n.about.map((t, k) => (
            <p
              key={t}
              className={cn(
                "mt-2.5 text-[0.9rem] leading-[1.6] tracking-[0.01em] text-[#f6efe0]/65 sm:text-[0.98rem] lg:mt-3.5",
                k > 0 && !more && "max-lg:hidden [@media(max-height:820px)]:hidden",
              )}
            >
              {t}
            </p>
          ))}
          {n.about.length > 1 && !more && (
            <button type="button" onClick={() => setMore(true)} className="mt-2 text-sm text-[#f6efe0]/80 underline underline-offset-4 lg:hidden [@media(max-height:820px)]:inline">
              Continua a leggere
            </button>
          )}
          <dl className="mt-3 grid gap-0.5 text-[0.9rem] sm:text-[0.98rem] lg:mt-5 lg:gap-1">
            {n.lineup.map((l) => (
              <div key={l}>
                <dd className="font-semibold text-[#f6efe0]/80">{l}</dd>
              </div>
            ))}
            {n.entry && (
              <div>
                <dd className="text-[#f6efe0]/65">{n.entry}</dd>
              </div>
            )}
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 lg:mt-7">
            <a
              href={whatsappUrl(waMessage.serata(n.title, n.day))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-[#f6efe0]/85 px-7 py-3 text-[0.9rem] tracking-[0.08em] text-[#f6efe0] uppercase transition-colors hover:bg-[#f6efe0] hover:text-ink"
            >
              Prenota su WhatsApp
            </a>
            <Link href="/serate" className="inline-flex items-center gap-2 text-sm tracking-[0.06em] text-[#f6efe0]/60 uppercase transition-colors hover:text-[#f6efe0]">
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
  return <video src={src} poster={poster} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
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
    <div className="absolute inset-0 bg-black/30">
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
            sizes="(min-width:1024px) 50vw, 100vw"
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

