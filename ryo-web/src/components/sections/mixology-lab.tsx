"use client"

import dynamic from "next/dynamic"
import { useMemo, useRef, useState } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { MousePointer2, Shuffle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/section-heading"
import { Reveal } from "@/components/motion/reveal"
import { FLAVORS, bases, blendProfile, garnishes, mixColor, modifiers, type Ingredient } from "@/content/mixology"
import { cn } from "@/lib/utils"

// three.js pesa: caricato solo nel browser e solo per questa sezione.
const CocktailScene = dynamic(() => import("@/components/mixology/cocktail-scene"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-muted-foreground">Preparazione del bancone 3D…</div>,
})

export function MixologyLab() {
  const [base, setBase] = useState(bases[0])
  const [modifier, setModifier] = useState(modifiers[0])
  const [garnish, setGarnish] = useState(garnishes[0])
  const stage = useRef<HTMLDivElement>(null)
  const inView = useInView(stage, { margin: "200px 0px" })
  const reduce = useReducedMotion() ?? false

  const profile = useMemo(() => blendProfile(base, modifier, garnish), [base, modifier, garnish])
  const color = useMemo(() => mixColor(base.color, modifier.color, 0.65), [base, modifier])
  const dominant = useMemo(() => [...FLAVORS].sort((a, b) => profile[b] - profile[a]).slice(0, 2), [profile])

  const shuffle = () => {
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
    setBase(pick(bases))
    setModifier(pick(modifiers))
    setGarnish(pick(garnishes))
  }

  return (
    <section id="mixology-lab" className="tessellated relative border-y border-border py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Esperienza interattiva"
            title={
              <>
                Mixology <span className="text-brass-gradient italic">Lab 3D</span>
              </>
            }
            intro="Ruota il bicchiere, scambia gli ingredienti e scopri come cambia il profilo aromatico del tuo drink. Poi chiedi al bancone di prepararlo davvero."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          {/* Stage 3D */}
          <div
            ref={stage}
            className="relative h-[440px] overflow-hidden rounded-[2rem] border border-border bg-[radial-gradient(70%_60%_at_50%_45%,rgb(201_162_75/0.16),transparent_70%),linear-gradient(180deg,#0d1913,#070d0a)] sm:h-[560px] lg:col-span-7"
          >
            {inView && <CocktailScene liquidColor={color} garnish={garnish.kind} active={inView} reduceMotion={reduce} />}
            <p className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-background/60 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
              <MousePointer2 className="size-3.5" /> Trascina per ruotare
            </p>
            <div className="absolute top-5 left-5 rounded-2xl bg-background/50 px-4 py-3 backdrop-blur">
              <p className="text-[0.65rem] tracking-[0.3em] text-brass uppercase">Il tuo drink</p>
              <p className="font-display text-xl">{base.name} · {modifier.name}</p>
            </div>
          </div>

          {/* Pannello ingredienti */}
          <div className="flex flex-col gap-6 rounded-[2rem] border border-border bg-card/70 p-6 backdrop-blur sm:p-8 lg:col-span-5">
            <Picker label="Base" items={bases} value={base} onChange={setBase} />
            <Picker label="Modificatore" items={modifiers} value={modifier} onChange={setModifier} />
            <Picker label="Guarnizione" items={garnishes} value={garnish} onChange={(g) => setGarnish(g as typeof garnish)} />

            <div className="brass-rule opacity-40" />

            <div>
              <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-brass uppercase">Profilo aromatico</p>
              <ul className="space-y-2.5">
                {FLAVORS.map((f) => (
                  <li key={f} className="grid grid-cols-[88px_1fr_24px] items-center gap-3 text-sm">
                    <span className={cn("text-muted-foreground", dominant.includes(f) && "text-foreground")}>{f}</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                      <motion.span
                        className="block h-full rounded-full bg-gradient-to-r from-brass to-brass-light"
                        animate={{ width: `${profile[f] * 10}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      />
                    </span>
                    <span className="text-right text-xs text-muted-foreground tabular-nums">{profile[f]}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm leading-relaxed text-foreground/80">
                <span className="font-display text-lg text-brass-light italic">Note di degustazione — </span>
                {base.note.toLowerCase()}, {modifier.note.toLowerCase()}; in chiusura {garnish.note.toLowerCase()}. Prevalenza{" "}
                <strong className="font-semibold">{dominant.join(" e ").toLowerCase()}</strong>.
              </p>
            </div>

            <Button variant="outline" onClick={shuffle} className="mt-auto rounded-full">
              <Shuffle className="size-4" /> Sorprendimi
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Picker<T extends Ingredient>({ label, items, value, onChange }: { label: string; items: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-semibold tracking-[0.25em] text-brass uppercase">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {items.map((it) => {
          const selected = it.id === value.id
          return (
            <button
              key={it.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(it)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all",
                selected ? "border-brass bg-brass/15 text-foreground shadow-[0_0_20px_-6px_var(--brass)]" : "border-border text-foreground/70 hover:border-foreground/30 hover:text-foreground",
              )}
            >
              <span className="size-3 rounded-full ring-1 ring-white/20" style={{ background: it.color }} aria-hidden />
              {it.name}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
