"use client"

import Image from "next/image"
import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"

import { SectionHeading } from "@/components/section-heading"
import { Reveal } from "@/components/motion/reveal"

const pillars = [
  { n: "01", title: "Materia prima", text: "Distillati selezionati, sciroppi e infusi preparati in casa, ghiaccio cristallino." },
  { n: "02", title: "Tecnica", text: "Ricette bilanciate al millilitro, rispetto dei classici e libertà nei signature." },
  { n: "03", title: "Ospitalità", text: "Ogni drink nasce da una conversazione: raccontaci cosa ti piace, al resto pensiamo noi." },
]

export function Philosophy() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const yMain = useTransform(scrollYProgress, [0, 1], [60, -60])
  const ySmall = useTransform(scrollYProgress, [0, 1], [140, -140])
  const clip = useTransform(scrollYProgress, [0.05, 0.35], ["inset(18% 18% 18% 18% round 32px)", "inset(0% 0% 0% 0% round 32px)"])

  return (
    <section id="filosofia" ref={ref} className="relative overflow-hidden py-28 sm:py-40">
      <div className="mx-auto grid grid-cols-1 max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-12">
        {/* Colonna immagini: asimmetrica, parallax a velocità diverse */}
        <div className="relative lg:col-span-6">
          <motion.div style={reduce ? undefined : { y: yMain, clipPath: clip }} className="relative aspect-[4/5] w-[85%] overflow-hidden rounded-[2rem]">
            <Image
              src="/images/staff/master-bartender.jpg"
              alt="Il master bartender di RYO serve un cocktail davanti al sipario di velluto verde"
              fill
              sizes="(min-width: 1024px) 40vw, 85vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-6 pt-20">
              <p className="eyebrow">Master bartender</p>
              <p className="font-display text-xl">Nome Cognome</p>
            </div>
          </motion.div>
          <motion.div
            style={reduce ? undefined : { y: ySmall }}
            className="absolute right-0 -bottom-10 aspect-[3/4] w-[42%] overflow-hidden rounded-[1.5rem] border-[6px] border-background shadow-2xl"
          >
            <Image src="/images/locale/sala-giungla.jpg" alt="La sala con felci sospese e lampade in rattan" fill sizes="(min-width: 1024px) 20vw, 42vw" className="object-cover" />
          </motion.div>
          <div className="jungle-glow absolute -top-10 -left-10 -z-10 size-56 rounded-full opacity-60" />
        </div>

        {/* Testo narrativo */}
        <div className="lg:col-span-6 lg:pl-8">
          <Reveal>
            <SectionHeading
              eyebrow="La nostra filosofia"
              title={
                <>
                  Un drink è un <span className="text-hot">viaggio.</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-lg leading-relaxed text-foreground/80">
              Felci che scendono dal soffitto, ottone che cattura la luce, legno caldo sotto le mani: RYO è una giungla urbana nel centro di Cava de&apos; Tirreni.
              Qui la mixology è un rito lento, fatto di ascolto, precisione e un pizzico di teatro.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-border bg-border">
            {pillars.map((p, i) => (
              <Reveal key={p.n} delay={0.15 + i * 0.1} className="flex gap-6 bg-background p-6">
                <span className="font-display text-2xl text-orange tabular-nums">{p.n}</span>
                <div>
                  <h3 className="font-display text-lg">{p.title}</h3>
                  <p className="mt-1 text-muted-foreground">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
