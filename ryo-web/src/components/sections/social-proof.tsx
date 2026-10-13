"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "framer-motion"
import { Quote, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { SectionHeading } from "@/components/section-heading"
import { Reveal } from "@/components/motion/reveal"
import { reviews, stats } from "@/content/experience"
import { site } from "@/content/site"

export function SocialProof() {
  return (
    <section id="recensioni" className="relative overflow-hidden border-y border-border bg-card/40 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Traguardi */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-border bg-border lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="bg-background p-8 text-center">
              <p className="font-display text-5xl text-hot sm:text-6xl">
                <Counter to={s.value} decimals={"decimals" in s ? s.decimals : 0} />
                {s.suffix}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-24">
          <SectionHeading
            align="center"
            demo
            eyebrow="Dicono di noi"
            title={
              <>
                Cinque stelle, <span className="text-hot">una notte dopo l&apos;altra.</span>
              </>
            }
            intro={site.demo ? "Testi dimostrativi: in produzione verranno mostrate le recensioni verificate di Google e TripAdvisor." : undefined}
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <Carousel opts={{ align: "start", loop: true }} className="mx-auto max-w-6xl" aria-label="Recensioni">
            <CarouselContent>
              {reviews.map((r, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full rounded-[2rem] border-border bg-background/70">
                    <CardContent className="flex h-full flex-col gap-5 p-7">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-0.5" aria-label={`${r.rating} stelle su 5`}>
                          {Array.from({ length: r.rating }, (_, k) => <Star key={k} className="size-4 fill-amber text-amber" />)}
                        </div>
                        <Badge variant="outline" className="rounded-full border-border text-xs">{r.source}</Badge>
                      </div>
                      <Quote className="size-7 text-amber/40" />
                      <p className="flex-1 text-lg leading-relaxed text-[#e3dac6]">“{r.text}”</p>
                      <p className="text-sm text-muted-foreground">{r.author} · {r.date}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-8 flex justify-center gap-3">
              <CarouselPrevious className="static translate-y-0 rounded-full border-border bg-transparent" />
              <CarouselNext className="static translate-y-0 rounded-full border-border bg-transparent" />
            </div>
          </Carousel>
        </Reveal>
      </div>
    </section>
  )
}

function Counter({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20% 0px" })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, to, { duration: 2, ease: [0.22, 1, 0.36, 1], onUpdate: setValue })
    return () => controls.stop()
  }, [inView, reduce, to])

  const shown = reduce ? to : value
  return <span ref={ref} className="tabular-nums">{shown.toLocaleString("it-IT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
}
