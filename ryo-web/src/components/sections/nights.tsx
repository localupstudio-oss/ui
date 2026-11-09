import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Reveal } from "@/components/motion/reveal"
import { nights } from "@/content/experience"

/**
 * Le serate della settimana: solo le locandine. Sopra la foto, in alto a sinistra, giorno e titolo su una
 * velatura scura che lascia intravedere l'immagine; in basso il pulsante «Scopri».
 */
export function Nights() {
  return (
    <section id="serate" className="pt-6 pb-28 sm:pt-8 sm:pb-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 md:gap-10">
          {nights.map((n, i) => (
            <Reveal key={n.day} delay={i * 0.1}>
              <Link
                href={`/serate/${n.slug}`}
                className="group relative block aspect-[1170/1901] overflow-hidden rounded-sm"
                aria-label={`Scopri ${n.title}, ogni ${n.day.toLowerCase()}`}
              >
                <Image
                  src={n.image}
                  alt={`${n.title}, il ${n.day.toLowerCase()} da RYO`}
                  fill
                  quality={90}
                  sizes="(min-width: 768px) 440px, 100vw"
                  style={{ objectPosition: n.imagePosition }}
                  className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                {/* velature: scure in alto per il titolo e in basso per il pulsante, trasparenti al centro */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/0 via-45% to-black/55" />

                <div className="absolute inset-x-0 top-0 p-6 sm:p-8">
                  <p className="text-xs tracking-[0.28em] text-[#f6efe0]/75 uppercase">Ogni {n.day.toLowerCase()}</p>
                  <h3 className="mt-2 font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.12] tracking-[0.01em] text-[#f6efe0] uppercase">
                    {n.title}
                  </h3>
                  <span className="mt-4 block h-px w-12 bg-[#f6efe0]/60 transition-all duration-500 group-hover:w-20" aria-hidden />
                </div>

                {/* le info della serata a sinistra, a metà altezza, su vetro smerigliato: l'immagine si intravede */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 sm:px-8">
                  <div className="max-w-[85%] border-l border-[#f6efe0]/50 bg-black/25 py-4 pr-5 pl-4 backdrop-blur-[6px]">
                    <p className="text-[0.88rem] leading-snug font-semibold text-[#f6efe0]/90">{n.mood}</p>
                    <p className="mt-2.5 text-[0.8rem] tracking-[0.04em] text-[#f6efe0]/75">
                      {n.time?.replace("Start ", "Dalle ")} · {n.lineup[0]}
                    </p>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 flex justify-center p-6 sm:p-8">
                  <span className="inline-flex items-center gap-3 rounded-full border border-[#f6efe0]/80 bg-[#f6efe0]/5 px-8 py-3 text-[0.82rem] tracking-[0.18em] text-[#f6efe0] uppercase backdrop-blur-md transition-all duration-300 group-hover:border-[#f6efe0] group-hover:bg-[#f6efe0] group-hover:text-ink">
                    Scopri
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
