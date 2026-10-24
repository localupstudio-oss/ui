import { FileText } from "lucide-react"

import { Reveal } from "@/components/motion/reveal"
import carta from "@/content/carta.json"
import { menus } from "@/content/site"

type Categoria = (typeof carta.cucina)[number]

/** Un riquadro per ogni menu: apre il PDF ufficiale del locale. */
export function MenuPdfButtons() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-5 py-24 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
      {menus.map((m) => (
        <Reveal key={m.label}>
          {m.href ? (
            <a
              href={m.href}
              target="_blank"
              rel="noopener"
              className="group flex h-full flex-col items-center gap-4 border border-border bg-background/60 px-8 py-12 text-center transition-colors hover:border-amber hover:bg-bg-2"
            >
              <FileText className="size-6 text-amber" aria-hidden />
              <span className="font-display text-4xl">{m.label}</span>
              <span className="text-foreground/70">{m.sub}</span>
              <span className="link-underline mt-2">Apri il PDF</span>
            </a>
          ) : (
            <div className="flex h-full flex-col items-center gap-4 border border-dashed border-border bg-background/40 px-8 py-12 text-center text-foreground/60">
              <FileText className="size-6" aria-hidden />
              <span className="font-display text-4xl">{m.label}</span>
              <span className="text-sm tracking-[0.2em] uppercase">In arrivo</span>
            </div>
          )}
        </Reveal>
      ))}
    </section>
  )
}

/** La carta in HTML (leggibile anche da Google e dagli screen reader), dalla stessa fonte dei PDF. */
export function MenuCarta() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 sm:px-8">
      <Block id="cucina" title="La cucina" categorie={carta.cucina} />
      <Block id="drink" title="La drink list" categorie={carta.drink} />
      <p className="mt-16 text-center text-sm text-foreground/60">{carta.coperto}</p>
      <p className="mt-2 text-center text-sm text-foreground/60">
        Per allergie e intolleranze chiedi al personale: ti indicheremo gli allergeni di ogni preparazione.
      </p>
    </div>
  )
}

function Block({ id, title, categorie }: { id: string; title: string; categorie: Categoria[] }) {
  return (
    <section id={id} className="pt-16">
      <h2 className="text-center font-display text-5xl">{title}</h2>
      {categorie.map((c) => (
        <Reveal key={c.id} className="mt-14">
          <h3 className="text-center font-display text-3xl text-amber-light italic">{c.nome}</h3>
          <ul className="mt-6">
            {c.piatti.map((p) => (
              <li key={p.nome} className="flex items-baseline justify-between gap-6 border-b border-border py-4">
                <div>
                  <p className="font-display text-xl">{p.nome}</p>
                  {p.descrizione && <p className="mt-1 text-sm leading-relaxed text-foreground/65">{p.descrizione}</p>}
                </div>
                <p className="shrink-0 tabular-nums text-foreground/90">{p.prezzo}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </section>
  )
}
