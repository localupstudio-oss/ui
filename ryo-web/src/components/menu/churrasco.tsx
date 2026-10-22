import Link from "next/link"

import { Reveal } from "@/components/motion/reveal"
import carta from "@/content/carta.json"

export const MENU_PDF = { cucina: "/menu/ryo-menu-cucina.pdf", drink: "/menu/ryo-drink-list.pdf" } as const

/** Il Menu Churrasco: sempre in evidenza, come un menu a parte. */
export function ChurrascoFeature({ id }: { id?: string }) {
  const ch = carta.churrasco
  return (
    <section id={id} className="px-3 sm:px-10">
      <Reveal className="relative isolate mx-auto max-w-[1800px] overflow-hidden bg-[#0a1f13] px-6 py-20 text-center sm:py-28">
        {/* brace: bagliore caldo dal basso */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_110%,rgb(200_121_77/0.35),transparent_70%)]" />
        <div aria-hidden className="absolute inset-3 -z-10 border border-amber/60 sm:inset-5" />
        <div aria-hidden className="absolute inset-[18px] -z-10 border border-amber/25 sm:inset-[26px]" />

        <p className="text-sm tracking-[0.3em] text-amber uppercase">L&apos;esperienza della casa</p>
        <h2 className="mt-6 font-display text-[clamp(3.2rem,9vw,7rem)] leading-none italic">Churrasco</h2>
        <p className="mt-3 font-display text-2xl">Menù</p>
        <div className="mx-auto my-8 h-px w-24 bg-amber/70" />
        <p className="font-display text-2xl sm:text-3xl">{ch.titolo}</p>
        <p className="mt-3 text-foreground/80">{ch.descrizione}</p>
        <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-8 gap-y-2 font-display text-xl text-amber-light italic sm:text-2xl">
          {ch.carni.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="mt-10 font-display text-5xl">
          {ch.prezzo} <span className="font-sans text-sm tracking-[0.2em] text-foreground/70 uppercase">a persona</span>
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="#prenota" className="rounded-full bg-primary px-8 py-3.5 text-primary-foreground transition-colors hover:bg-amber-light">
            Prenota il churrasco
          </Link>
          <a
            href={MENU_PDF.cucina}
            target="_blank"
            rel="noopener"
            className="rounded-full border border-foreground/80 px-8 py-3.5 transition-colors hover:bg-foreground hover:text-background"
          >
            Sfoglia il menu
          </a>
        </div>
      </Reveal>
    </section>
  )
}
