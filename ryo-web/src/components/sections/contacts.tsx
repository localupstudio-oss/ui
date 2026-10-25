import Image from "next/image"
import { AtSign, Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react"

import { DemoBadge } from "@/components/demo-badge"
import { Reveal } from "@/components/motion/reveal"
import { fullAddress, site, whatsappUrl } from "@/content/site"

const mapsPlace = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`RYO Cocktail bar ${fullAddress}`)}`
const mapsDirections = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`

/** Mappa (screenshot di Google Maps nei colori del sito), contatti e orari. Niente iframe né cookie di terze parti. */
export function Contacts() {
  const contacts = [
    { icon: MapPin, label: "Indirizzo", value: fullAddress, href: mapsPlace },
    { icon: Phone, label: "Telefono", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Scrivici in chat", href: whatsappUrl() },
    { icon: AtSign, label: "Instagram", value: "@ryococktailbar", href: site.social.instagram },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  ]

  return (
    <section className="px-5 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <a href={mapsPlace} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-sm border border-border" aria-label={`Apri ${site.fullName} su Google Maps`}>
            <div className="relative aspect-[1170/620]">
              <Image src="/images/contatti/mappa-ryo.png" alt={`Mappa di Cava de' Tirreni con la posizione di ${site.name}`} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]" />
              {/* segnaposto RYO al posto di quello di Google, con etichetta in stile sito */}
              <span className="absolute top-[63%] left-[51.3%] -translate-x-1/2 -translate-y-full">
                <span className="absolute bottom-0 left-1/2 size-10 -translate-x-1/2 translate-y-1/2 animate-ping rounded-full bg-amber/40" />
                <MapPin className="relative size-11 fill-ink text-cream drop-shadow-md" strokeWidth={1.5} />
              </span>
              <span className="absolute top-[48%] left-[54.5%] rounded-sm bg-ink px-3 py-2 text-cream shadow-xl sm:px-5 sm:py-5">
                <span className="block font-display text-base leading-tight whitespace-nowrap sm:hidden">{site.name}</span>
                <span className="hidden font-display text-xl leading-tight whitespace-nowrap sm:block">{site.fullName}</span>
                <span className="block text-[0.65rem] text-cream/75 sm:text-xs">{site.address.street}</span>
                <span className="mt-2 hidden text-xs tracking-[0.15em] text-amber-light uppercase sm:block">Aperti mer – dom</span>
              </span>
            </div>
            <span className="absolute right-4 bottom-4 hidden items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm text-ink shadow-lg sm:inline-flex">
              <Navigation className="size-4" /> Apri in Google Maps
            </span>
          </a>
          <a href={mapsDirections} target="_blank" rel="noopener noreferrer" className="link-underline mt-5 inline-block">
            Indicazioni stradali
          </a>
          <a href={mapsPlace} target="_blank" rel="noopener noreferrer" className="link-underline mt-5 ml-6 inline-block sm:hidden">
            Apri in Google Maps
          </a>
        </Reveal>

        <div className="grid grid-cols-1 content-start gap-12 lg:col-span-5">
          <Reveal>
            <h2 className="font-display text-4xl">Contatti</h2>
            <ul className="mt-6 divide-y divide-border">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a href={c.href} {...(c.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })} className="flex items-center gap-4 py-4 transition-opacity hover:opacity-70">
                    <c.icon className="size-5 shrink-0 text-amber" />
                    <span>
                      <span className="block text-xs tracking-[0.2em] text-foreground/55 uppercase">{c.label}</span>
                      <span className="block">{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="flex items-center gap-3 font-display text-4xl">Orari <DemoBadge /></h2>
            <dl className="mt-6 grid grid-cols-[1fr_auto] gap-x-6 gap-y-3">
              {site.hours.map((h) => (
                <div key={h.days} className="contents">
                  <dt className="flex items-center gap-3"><Clock className="size-4 text-amber/70" /> {h.days}</dt>
                  <dd className={h.value === "Chiuso" ? "text-right text-foreground/50" : "text-right tabular-nums"}>{h.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
