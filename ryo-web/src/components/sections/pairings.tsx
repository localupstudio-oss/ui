import Image from "next/image"
import { Plus } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { SectionHeading } from "@/components/section-heading"
import { Reveal } from "@/components/motion/reveal"
import { pairings } from "@/content/experience"

export function Pairings() {
  return (
    <section id="abbinamenti" className="relative bg-card/40 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            demo
            eyebrow="Consigli & abbinamenti"
            title={
              <>
                Il piatto giusto, <span className="text-hot">il drink perfetto.</span>
              </>
            }
            intro="Gli abbinamenti suggeriti dal nostro mixologist: contrasti e affinità che si esaltano a vicenda."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {pairings.map((p, i) => (
            <Reveal key={p.dish.name} delay={(i % 2) * 0.12}>
              <Card className="group gap-0 overflow-hidden rounded-[2rem] border-border bg-background/70 p-0">
                <div className="relative grid grid-cols-2">
                  {[p.dish, p.drink].map((x, j) => (
                    <div key={x.name} className="relative aspect-[4/5] overflow-hidden">
                      <Image src={x.image} alt={x.name} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-4 pt-16">
                        <p className="eyebrow text-[0.65rem]">{j === 0 ? "Piatto" : "Cocktail"}</p>
                        <p className="font-display text-lg">{x.name}</p>
                      </div>
                    </div>
                  ))}
                  <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-amber/50 bg-background/80 text-amber backdrop-blur">
                    <Plus className="size-5" />
                  </span>
                </div>
                <CardContent className="p-6">
                  <p className="leading-relaxed text-foreground/80">{p.synergy}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.notes.map((n) => (
                      <li key={n} className="rounded-full border border-amber/30 px-3 py-1 text-xs text-amber-light">{n}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
