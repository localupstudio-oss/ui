import Image from "next/image"
import Link from "next/link"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"

import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/brand-icons"
import { DemoBadge } from "@/components/demo-badge"
import { fullAddress, nav, site, whatsappUrl } from "@/content/site"
import { cn } from "@/lib/utils"

const socials = [
  { label: "Instagram", href: site.social.instagram, icon: InstagramIcon },
  { label: "TikTok", href: site.social.tiktok, icon: TikTokIcon },
  { label: "Facebook", href: site.social.facebook, icon: FacebookIcon },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-[#050a07] pt-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/brand/logo.png" alt="" width={56} height={56} />
            <span className="font-display text-3xl font-semibold tracking-[0.2em]">{site.name}</span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">{site.description}</p>
          <ul className="mt-6 flex gap-3">
            {socials.map(({ label, href, icon: Icon }) => {
              const configured = Boolean(href)
              return (
                <li key={label}>
                  <a
                    href={configured ? href : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={configured ? `${site.name} su ${label}` : `${label} (in arrivo)`}
                    aria-disabled={!configured}
                    title={configured ? label : `${label}: link da configurare`}
                    className={cn(
                      "group relative grid size-12 place-items-center overflow-hidden rounded-full border border-border text-foreground/80 transition-all duration-500",
                      configured ? "hover:-translate-y-1 hover:border-brass hover:text-primary-foreground hover:shadow-[0_10px_30px_-10px_var(--brass)]" : "cursor-not-allowed opacity-40",
                    )}
                  >
                    <span className="absolute inset-0 translate-y-full bg-brass transition-transform duration-500 group-hover:translate-y-0" />
                    <Icon className="relative size-5" />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-xs font-semibold tracking-[0.25em] text-brass uppercase">Contatti</h3>
          <ul className="mt-5 grid gap-3 text-sm">
            <li className="flex gap-3"><MapPin className="size-4 shrink-0 text-brass" /> {fullAddress}</li>
            <li><a className="flex gap-3 hover:text-brass" href={`tel:${site.phone.replace(/\s/g, "")}`}><Phone className="size-4 text-brass" /> {site.phone}</a></li>
            <li><a className="flex gap-3 hover:text-brass" href={whatsappUrl()} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4 text-brass" /> WhatsApp</a></li>
            <li><a className="flex gap-3 hover:text-brass" href={`mailto:${site.email}`}><Mail className="size-4 text-brass" /> {site.email}</a></li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-brass uppercase">Orari <DemoBadge /></h3>
          <dl className="mt-5 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
            {site.hours.map((h) => (
              <div key={h.days} className="contents">
                <dt className="text-muted-foreground">{h.days}</dt>
                <dd className={cn("text-right tabular-nums", h.value === "Chiuso" && "text-ember")}>{h.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <nav aria-label="Link rapidi" className="lg:col-span-2">
          <h3 className="text-xs font-semibold tracking-[0.25em] text-brass uppercase">Esplora</h3>
          <ul className="mt-5 grid gap-2 text-sm">
            {nav.map((n) => <li key={n.href}><Link href={`/${n.href}`} className="text-muted-foreground hover:text-foreground">{n.label}</Link></li>)}
            <li><Link href="/#prenota" className="text-muted-foreground hover:text-foreground">Prenota</Link></li>
          </ul>
        </nav>
      </div>

      <div className="brass-rule mx-auto mt-16 max-w-7xl opacity-40" />

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-muted-foreground sm:px-8 md:flex-row md:items-center md:justify-between">
        <p>
          © {site.company.legalName} · P.IVA {site.company.vat} · REA {site.company.rea}
        </p>
        <p className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link href="/cookie" className="hover:text-foreground">Cookie Policy</Link>
          <span>Bevi responsabilmente</span>
        </p>
      </div>
    </footer>
  )
}
