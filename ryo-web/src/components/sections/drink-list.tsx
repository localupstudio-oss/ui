"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { useCallback, useRef, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion"
import { Camera, ChevronLeft, ChevronRight, Hand } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DemoBadge } from "@/components/demo-badge"
import { SectionHeading } from "@/components/section-heading"
import { Reveal } from "@/components/motion/reveal"
import { ALLERGENS, FLAVORS, drinkShowcase, formatPrice } from "@/content/menu"
import { cn } from "@/lib/utils"

// three.js è pesante: caricato solo nel browser e solo per questa sezione.
const DrinkScene = dynamic(() => import("@/components/drinks/drink-scene"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center font-mono text-xs text-muted-foreground">Il bartender sta preparando il bancone…</div>,
})

const drinks = drinkShowcase

// Etichette 3D degli ingredienti solo su schermi ampi (su mobile coprirebbero il bicchiere).
const wideQuery = "(min-width: 768px)"
const subscribeWide = (cb: () => void) => {
  const m = window.matchMedia(wideQuery)
  m.addEventListener("change", cb)
  return () => m.removeEventListener("change", cb)
}
const useIsWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(wideQuery).matches, () => false)

export function DrinkList() {
  const [index, setIndex] = useState(0)
  const stage = useRef<HTMLDivElement>(null)
  const inView = useInView(stage, { margin: "200px 0px" })
  const reduce = useReducedMotion() ?? false
  const wide = useIsWide()
  const labelEls = useRef<(HTMLElement | null)[]>([])
  const drink = drinks[index]

  const go = useCallback((dir: 1 | -1) => setIndex((i) => (i + dir + drinks.length) % drinks.length), [])

  return (
    <section id="drink-list" className="jungle-glow relative bg-bg-2 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            eyebrow="Dal bancone"
            demo
            title={
              <>
                Drink list <span className="text-hot">3D</span>
              </>
            }
            intro="Ogni drink di RYO è preparato al momento dai nostri bartender. Qui puoi esplorarli in 3D: ruota il bicchiere, scopri ingredienti e profilo di gusto, poi ordinalo al bancone."
          />
          <p className="font-mono text-xs text-muted-foreground">
            {String(index + 1).padStart(2, "0")} / {String(drinks.length).padStart(2, "0")}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Stage 3D */}
          <div
            ref={stage}
            tabIndex={0}
            aria-roledescription="vetrina 3D"
            aria-label={`${drink.name}. Usa le frecce sinistra e destra per cambiare drink.`}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(1)
              if (e.key === "ArrowLeft") go(-1)
            }}
            className="relative h-[460px] overflow-hidden rounded-[22px] border border-border bg-[radial-gradient(60%_55%_at_50%_55%,rgb(240_179_64/0.14),transparent_70%),linear-gradient(180deg,#132a1d,#0a1410)] outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-[580px] lg:col-span-7"
          >
            {inView && (
              <DrinkScene
                drinkId={drink.id}
                visual={drink.visual}
                active={inView}
                reduceMotion={reduce}
                labels={labelEls}
                labelCount={wide ? drink.ingredients.length : 0}
              />
            )}
            {/* Etichette ingredienti agganciate al bicchiere 3D (posizionate dalla scena) */}
            {inView && wide && (
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                {drink.ingredients.map((name, i) => (
                  <span
                    key={`${drink.id}-${name}`}
                    ref={(el) => {
                      labelEls.current[i] = el
                    }}
                    className="absolute top-0 left-0 rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-[0.68rem] whitespace-nowrap opacity-0 backdrop-blur transition-opacity duration-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-7">
              <AnimatePresence mode="wait">
                <motion.div key={drink.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                  <p className="eyebrow">{drink.category}</p>
                  <p className="mt-2 font-display text-3xl sm:text-5xl">{drink.name}</p>
                </motion.div>
              </AnimatePresence>
              <span className="rounded-full bg-orange px-4 py-1.5 font-mono text-sm font-bold text-white tabular-nums">{formatPrice(drink.price)}</span>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5 sm:p-7">
              <Button variant="outline" size="icon-lg" onClick={() => go(-1)} aria-label="Drink precedente" className="bg-background/40 backdrop-blur">
                <ChevronLeft />
              </Button>
              <p className="pointer-events-none flex items-center gap-2 rounded-full bg-background/60 px-4 py-2 font-mono text-[0.7rem] text-muted-foreground backdrop-blur">
                <Hand className="size-3.5" /> Trascina per ruotare
              </p>
              <Button variant="outline" size="icon-lg" onClick={() => go(1)} aria-label="Drink successivo" className="bg-background/40 backdrop-blur">
                <ChevronRight />
              </Button>
            </div>
          </div>

          {/* Scheda del drink */}
          <AnimatePresence mode="wait">
            <motion.article
              key={drink.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-6 rounded-[22px] border border-border bg-background/60 p-6 sm:p-8 lg:col-span-5"
            >
              <div>
                <div className="flex flex-wrap gap-2">
                  {drink.tags?.map((t) => (
                    <span key={t} className="rounded-full border border-border bg-bg-3 px-3 py-1 font-mono text-[0.68rem] uppercase">{t}</span>
                  ))}
                </div>
                <p className="mt-4 text-lg leading-relaxed text-[#d7cfbd]">{drink.description}</p>
              </div>

              <div>
                <p className="eyebrow mb-3">Ingredienti</p>
                <ul className="flex flex-wrap gap-2">
                  {drink.ingredients.map((i) => (
                    <li key={i} className="rounded-full border border-border px-3 py-1 text-sm">{i}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow mb-3">Profilo di gusto</p>
                <ul className="space-y-2.5">
                  {FLAVORS.map((f) => {
                    const v = drink.profile?.[f] ?? 0
                    return (
                      <li key={f} className="grid grid-cols-[88px_1fr] items-center gap-3 text-sm">
                        <span className={cn("text-muted-foreground", v >= 6 && "text-foreground")}>{f}</span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                          <motion.span
                            className="block h-full rounded-full bg-gradient-to-r from-orange to-amber"
                            initial={{ width: 0 }}
                            animate={{ width: `${v * 10}%` }}
                            transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.1 }}
                          />
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                <span className="eyebrow mr-2 text-[0.66rem]">Allergeni</span>
                {drink.allergens.length ? drink.allergens.map((a) => ALLERGENS[a]).join(", ") : "nessun allergene principale"}
              </p>

              <div className="mt-auto flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-11 flex-1">
                  <a href="#prenota">Prenota per assaggiarlo</a>
                </Button>
                {drink.image && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="lg" className="h-11">
                        <Camera /> Foto reale
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg overflow-hidden border-border bg-background p-0">
                      <div className="relative aspect-[4/5]">
                        <Image src={drink.image} alt={drink.name} fill sizes="512px" className="object-cover" />
                      </div>
                      <div className="p-5">
                        <DialogTitle className="font-display text-2xl">{drink.name}</DialogTitle>
                        <DialogDescription>{drink.description}</DialogDescription>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        {/* Selettore drink */}
        <div role="tablist" aria-label="Scegli un drink" className="mt-8 flex snap-x gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]">
          {drinks.map((d, i) => (
            <button
              key={d.id}
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "group flex shrink-0 snap-start items-center gap-3 rounded-full border py-1.5 pr-5 pl-1.5 text-left transition-all",
                i === index ? "border-orange bg-orange/15" : "border-border hover:border-foreground/40",
              )}
            >
              <span className="relative size-11 overflow-hidden rounded-full bg-bg-3">
                {d.image && <Image src={d.image} alt="" fill sizes="44px" className="object-cover" />}
              </span>
              <span>
                <span className="block font-display text-sm">{d.name}</span>
                <span className="block font-mono text-[0.66rem] text-muted-foreground">{d.category} · {formatPrice(d.price)}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <DemoBadge label="Prezzi demo" /> Nomi, ricette e prezzi sono esempi da sostituire con la drink list ufficiale.
        </p>
      </div>
    </section>
  )
}
