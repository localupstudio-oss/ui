"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Mic2, UtensilsCrossed, Music4 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"
import { thursday } from "@/content/experience"
import { waMessage, whatsappUrl } from "@/content/site"
import { cn } from "@/lib/utils"

const icons = [UtensilsCrossed, Mic2, Music4]

/** "Quelli che il Giovedì": la serata del giovedì con cena, karaoke tra i tavoli e festa. */
export function Thursday() {
  const reduce = useReducedMotion()

  return (
    <section id="giovedi" className="relative overflow-hidden py-28 sm:py-36">
      {/* Bagliore neon blu/arancio come l'insegna della serata */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_15%_20%,rgb(88_101_242/0.18),transparent_70%),radial-gradient(45%_40%_at_90%_70%,rgb(229_103_42/0.16),transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow flex items-center gap-3">
              Ogni giovedì · Giovedì RYO
            </p>
            <motion.div
              className="relative mt-6 w-full max-w-md"
              animate={reduce ? undefined : { filter: ["brightness(1)", "brightness(1.18)", "brightness(0.96)", "brightness(1.1)", "brightness(1)"] }}
              transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2.5 }}
            >
              <Image
                src={thursday.logo}
                alt={thursday.name}
                width={536}
                height={324}
                className="h-auto w-full drop-shadow-[0_0_40px_rgb(229_103_42/0.35)]"
              />
            </motion.div>
            <h2 className="mt-8 font-display text-[clamp(2rem,4.5vw,3.2rem)] text-balance">
              {thursday.claim.split(".")[0]}.<span className="text-hot">{thursday.claim.split(".").slice(1).join(".")}</span>
            </h2>
            <p className="mt-5 max-w-[50ch] text-lg leading-relaxed text-[#d7cfbd]">{thursday.intro}</p>

            <ul className="mt-8 grid gap-3">
              {thursday.moments.map((m, i) => {
                const Icon = icons[i]
                return (
                  <li key={m.title} className="flex gap-4 rounded-sm border border-border bg-bg-2/70 p-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange/15 text-orange">
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-display text-lg">{m.title}</span>
                      <span className="block text-sm text-muted-foreground">{m.text}</span>
                    </span>
                  </li>
                )
              })}
            </ul>

            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm">
              {thursday.details.map((d) => (
                <div key={d.label}>
                  <dt className="eyebrow text-[0.66rem]">{d.label}</dt>
                  <dd className="mt-1">{d.value}</dd>
                </div>
              ))}
            </dl>

            <Button asChild size="lg" className="mt-9 h-12 px-7">
              <a href={whatsappUrl(waMessage.serata("Quelli che il Giovedì", "Giovedì"))} target="_blank" rel="noopener noreferrer">Prenota il tuo giovedì su WhatsApp</a>
            </Button>
          </Reveal>

          {/* Galleria a mosaico */}
          <div className="grid grid-flow-dense grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7">
            {thursday.gallery.map((g, i) => (
              <Reveal
                key={g.src}
                delay={(i % 3) * 0.08}
                className={cn(
                  "group relative overflow-hidden rounded-sm bg-bg-3",
                  "wide" in g && g.wide ? "col-span-2 aspect-[2/1] sm:col-span-3" : "aspect-[3/4]",
                )}
              >
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  sizes="(min-width: 1024px) 20vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
