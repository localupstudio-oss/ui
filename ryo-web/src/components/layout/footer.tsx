import Image from "next/image"
import Link from "next/link"

import { DemoBadge } from "@/components/demo-badge"
import { Booking } from "@/components/sections/booking"
import { fullAddress, nav, site, whatsappUrl } from "@/content/site"

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`

const brands = ["Churrascaria", "Tapas", "Cocktail", "Quelli che il Giovedì", "This is RYO Weekend", "Cava de' Tirreni"]

/** Footer con il modulo di prenotazione in fondo a ogni pagina (disattivabile dove il modulo c'è già). */
export function Footer({ booking = true }: { booking?: boolean }) {
  const socials = [
    { label: "Instagram", href: site.social.instagram },
    { label: "Facebook", href: site.social.facebook },
    { label: "TikTok", href: site.social.tiktok },
  ].filter((s) => s.href)

  return (
    <>
    {booking && <Booking />}
    <footer className="cream-surface">
      {/* Nastro con le anime del locale */}
      <div aria-hidden className="overflow-hidden border-b border-ink/15 bg-[#d9cba9] py-9">
        <div className="animate-marquee flex w-max items-center gap-16 font-display text-3xl whitespace-nowrap text-ink/80 italic">
          {[...brands, ...brands].map((b, i) => (
            <span key={i} className="flex items-center gap-16">
              {b}
              <span className="text-xl not-italic">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-14 px-5 py-20 sm:px-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="max-w-md font-display text-[clamp(1.9rem,3vw,2.6rem)] leading-tight">
            RYO ti aspetta per una serata fuori dall&apos;ordinario.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#prenota" className="rounded-full bg-ink px-7 py-3 text-cream transition-colors hover:bg-green">
              Prenota un tavolo
            </Link>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink px-7 py-3 transition-colors hover:bg-ink hover:text-cream"
            >
              Scrivici su WhatsApp
            </a>
          </div>
        </div>

        <nav aria-label="Il locale" className="lg:col-span-2">
          <h3 className="text-sm tracking-wide text-ink/60">Il locale</h3>
          <ul className="mt-5 grid gap-3 font-display text-xl">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:opacity-60">{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-2">
          <h3 className="text-sm tracking-wide text-ink/60">Trovaci</h3>
          <ul className="mt-5 grid gap-3 font-display text-xl">
            <li><a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-60">Google Maps</a></li>
            <li><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:opacity-60">Telefono</a></li>
            <li><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="hover:opacity-60">WhatsApp</a></li>
          </ul>
          <h3 className="mt-10 text-sm tracking-wide text-ink/60">Seguici</h3>
          <ul className="mt-5 grid gap-3 font-display text-xl">
            {socials.map((s) => (
              <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-60">{s.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="flex items-center gap-2 text-sm tracking-wide text-ink/60">Orari <DemoBadge /></h3>
          <dl className="mt-5 grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-sm">
            {site.hours.map((h) => (
              <div key={h.days} className="contents">
                <dt>{h.days}</dt>
                <dd className="text-right tabular-nums text-ink/75">{h.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm leading-relaxed text-ink/75">{fullAddress}</p>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1800px] flex-col gap-6 border-t border-ink/15 px-5 py-8 text-xs text-ink/70 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="flex items-center gap-4">
          <Image src="/images/brand/wordmark-dark.png" alt="" width={84} height={26} className="h-auto w-[84px]" />
          <span>© {site.company.legalName} · P.IVA {site.company.vat}</span>
        </div>
        <p className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/privacy" className="hover:text-ink">Privacy Policy</Link>
          <Link href="/cookie" className="hover:text-ink">Cookie Policy</Link>
          <span>Bevi responsabilmente</span>
        </p>
      </div>
    </footer>
    </>
  )
}
