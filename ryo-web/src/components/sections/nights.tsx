"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Clock, Music2, Shirt, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/section-heading"
import { Reveal } from "@/components/motion/reveal"
import { nights } from "@/content/experience"

export function Nights() {
  return (
    <section id="serate" className="py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            demo
            eyebrow="Le nostre serate"
            title={
              <>
                Tre notti, <span className="text-brass-gradient italic">tre anime.</span>
              </>
            }
            intro="Dal jazz dal vivo al DJ set, fino alla notte più esclusiva della settimana. Line-up aggiornate ogni settimana su Instagram."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {nights.map((n, i) => (
            <Reveal key={n.day} delay={i * 0.12}>
              <motion.article
                whileHover="hover"
                initial="rest"
                animate="rest"
                className="group relative flex h-[560px] flex-col justify-end overflow-hidden rounded-[2rem] border border-border"
              >
                <motion.div variants={{ rest: { scale: 1.02 }, hover: { scale: 1.1 } }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 -z-10">
                  <Image src={n.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </motion.div>
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/75 to-background/10" />

                <div className="absolute top-5 left-5">
                  <Badge className="rounded-full bg-brass px-3 py-1 text-xs font-semibold tracking-[0.2em] text-primary-foreground uppercase">{n.day}</Badge>
                </div>

                <div className="p-7">
                  <h3 className="font-display text-4xl leading-tight">{n.title}</h3>
                  <p className="mt-2 text-foreground/75">{n.mood}</p>

                  <dl className="mt-6 grid gap-3 border-t border-border pt-5 text-sm">
                    <Row icon={Clock} label="Orario" value={n.time} />
                    <Row icon={Music2} label="Line-up" value={n.lineup.join(" · ")} />
                    <Row icon={Shirt} label="Dress code" value={n.dressCode} />
                    <Row icon={Star} label="Highlight" value={n.highlight} />
                  </dl>

                  <Button asChild variant="outline" className="mt-6 w-full rounded-full border-brass/40 bg-transparent hover:bg-brass hover:text-primary-foreground">
                    <a href="#prenota">Riserva per {n.day.toLowerCase()}</a>
                  </Button>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Row({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[20px_92px_1fr] items-start gap-2">
      <Icon className="mt-0.5 size-4 text-brass" aria-hidden />
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground/90">{value}</dd>
    </div>
  )
}
