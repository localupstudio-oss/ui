import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock, Music2, Ticket, Star } from "lucide-react"

import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/section-heading"
import { nights } from "@/content/experience"

/** Le serate della settimana: locandina, due righe e «Scopri» verso la pagina della serata. */
export function Nights() {
  return (
    <section id="serate" className="py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            title={
              <>
                Le notti <span className="text-hot">di RYO</span>
              </>
            }
            intro="Giovedì si canta a tavola, venerdì si balla. Line-up e ospiti aggiornati ogni settimana su Instagram."
          />
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-4xl gap-14 md:grid-cols-2 md:gap-10">
          {nights.map((n, i) => (
            <Reveal key={n.day} delay={i * 0.1} className="flex flex-col">
              <Link href={`/serate/${n.slug}`} className="group block overflow-hidden rounded-sm">
                <div className="relative aspect-[1170/1901]">
                  <Image
                    src={n.image}
                    alt={`Locandina: ${n.title}, ${n.day.toLowerCase()} da RYO`}
                    fill
                    sizes="(min-width: 768px) 440px, 100vw"
                    className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
              <div className="mt-6 flex flex-1 flex-col items-center text-center">
                <p className="text-sm tracking-[0.2em] text-amber uppercase">{n.day}</p>
                <h3 className="mt-2 font-display text-3xl">{n.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-foreground/75">{n.mood}</p>
                <dl className="mx-auto mt-5 grid max-w-xs gap-2 text-left text-sm">
                  {n.time && <Row icon={Clock} value={n.time} />}
                  <Row icon={Music2} value={n.lineup.join(" · ")} />
                  {n.entry && <Row icon={Ticket} value={n.entry} />}
                  <Row icon={Star} value={n.highlight} />
                </dl>
                <span className="h-7" aria-hidden />
                <Link
                  href={`/serate/${n.slug}`}
                  className="mt-auto inline-flex items-center gap-2.5 rounded-full border border-foreground/80 px-8 py-3.5 transition-colors hover:bg-foreground hover:text-background"
                >
                  Scopri <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
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
