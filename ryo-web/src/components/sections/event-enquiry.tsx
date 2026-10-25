import Image from "next/image"
import { MessageCircle } from "lucide-react"

import { Reveal } from "@/components/motion/reveal"
import { site, waMessage, whatsappUrl } from "@/content/site"

/** Tipi di evento: ognuno apre la chat WhatsApp con la richiesta già scritta. */
const occasions = [
  { title: "Compleanni", text: "Festa dei 18, 30, 40 anni o semplicemente la tua: torta, musica e tavolo riservato.", tipo: "una festa di compleanno", image: "/images/eventi/festa-torta.jpg" },
  { title: "Feste private", text: "Lauree, anniversari, addii al celibato e al nubilato: costruiamo la serata intorno a te.", tipo: "una festa privata", image: "/images/giovedi/festa-al-tavolo.jpg" },
  { title: "Cene aziendali", text: "Cene di team, presentazioni e brindisi di fine anno, con menu dedicato e churrasco.", tipo: "una cena aziendale", image: "/images/giovedi/tavolata.jpg" },
]

export function EventEnquiry() {
  return (
    <section className="cream-surface px-5 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-[clamp(2.3rem,6vw,3.8rem)] leading-none">Organizza il tuo evento</h2>
        <p className="mx-auto mt-6 max-w-[58ch] leading-relaxed text-ink/75">
          Da 10 a 200 ospiti, anche in esclusiva. Scegli l&apos;occasione: si apre WhatsApp con il messaggio già pronto, completi data e numero di ospiti e
          ti rispondiamo noi con menu, allestimento e preventivo.
        </p>
      </div>
      <ul className="mx-auto mt-16 grid max-w-[1400px] grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-3">
        {occasions.map((o) => (
          <li key={o.title}>
            <Reveal className="flex h-full flex-col">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src={o.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
              </div>
              <h3 className="mt-6 font-display text-3xl">{o.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-ink/75">{o.text}</p>
              <a
                href={whatsappUrl(waMessage.evento(o.tipo))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2.5 self-start rounded-full bg-[#25d366] px-7 py-3.5 font-medium text-[#062e16] transition-colors hover:bg-[#3ee07a]"
              >
                <MessageCircle className="size-4" /> Prenota l&apos;evento
              </a>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-16 text-center text-sm text-ink/65">
        Preferisci parlarne a voce? Chiamaci al <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="link-underline">{site.phone}</a>
      </p>
    </section>
  )
}
