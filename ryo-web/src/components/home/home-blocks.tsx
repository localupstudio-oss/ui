import Image from "next/image"
import Link from "next/link"

import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

/** Introduzione centrata con due pulsanti a contorno. */
export function HomeIntro() {
  return (
    <section className="px-5 pt-32 pb-24 text-center sm:px-10 sm:pt-44 sm:pb-32">
      <Reveal>
        <h2 className="mx-auto max-w-5xl font-display text-[clamp(2.4rem,5.5vw,4.6rem)] text-balance">
          Entra nella giungla di RYO
        </h2>
        <p className="mx-auto mt-10 max-w-[62ch] text-lg leading-relaxed text-pretty text-foreground/80">
          Felci che scendono dal soffitto, luci calde e legno: nel cuore di Cava de&apos; Tirreni la churrascaria incontra le tapas da condividere e i
          cocktail d&apos;autore. Qui una cena diventa facilmente una festa.
        </p>
        <div className="mt-14 flex flex-wrap justify-center gap-4">
          <Link href="/menu" className="rounded-full border border-foreground/80 px-8 py-3.5 transition-colors hover:bg-foreground hover:text-background">
            Scopri i menu
          </Link>
          <Link href="/prenota" className="rounded-full border border-foreground/80 px-8 py-3.5 transition-colors hover:bg-foreground hover:text-background">
            Prenota ora
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

const strip = [
  { src: "/images/drink/highball-rosa.jpg", alt: "Highball rosa tra foglie tropicali" },
  { src: "/images/cucina/tartare.jpg", alt: "Tartare" },
  { src: "/images/giovedi/calici-microfono.jpg", alt: "Calici e microfono della serata del giovedì" },
  { src: "/images/drink/cocktail-foglia.jpg", alt: "Cocktail con foglia essiccata" },
  { src: "/images/cucina/paella.jpg", alt: "Paella da condividere" },
  { src: "/images/eventi/bancone-scimmia.jpg", alt: "Il bancone di sera" },
  { src: "/images/drink/bicchiere-ryo.jpg", alt: "Cocktail nel bicchiere RYO" },
  { src: "/images/cucina/burger.jpg", alt: "Burger con patate" },
  { src: "/images/giovedi/microfoni-menu.jpg", alt: "I microfoni sul menu cucina" },
  { src: "/images/drink/calice-stelo-verde.jpg", alt: "Cocktail nel calice dallo stelo verde" },
]

/** Fila di foto che scorre lentamente da sola (si ferma al passaggio del mouse). */
export function PhotoStrip() {
  return (
    <section aria-label="Galleria" className="group overflow-hidden pb-28 sm:pb-36">
      <div className="animate-marquee flex w-max gap-5 group-hover:[animation-play-state:paused] sm:gap-8">
        {[...strip, ...strip].map((p, i) => (
          <div key={i} aria-hidden={i >= strip.length} className="relative h-[52vh] max-h-[560px] min-h-[320px] w-[min(68vw,420px)] shrink-0 overflow-hidden">
            <Image src={p.src} alt={i >= strip.length ? "" : p.alt} fill sizes="420px" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  )
}

type FeatureProps = {
  href: string
  /** Apre in una nuova scheda (es. PDF). */
  external?: boolean
  title: string
  meta?: string
  cta?: string
  image: string
  alt: string
  size?: "full" | "half"
  position?: string
}

/** Grande riquadro fotografico con titolo serif e link sottolineato, con fronda sfocata in primo piano. */
export function FeatureCard({ href, external, title, meta, cta = "Scopri", image, alt, size = "full", position = "center" }: FeatureProps) {
  return (
    <Reveal className="h-full">
      <Link
        href={href}
        {...(external && { target: "_blank", rel: "noopener" })}
        className={cn(
          "group relative isolate flex h-full flex-col items-center justify-end overflow-hidden px-6 pb-14 text-center text-[#f6efe0] sm:pb-20",
          size === "full" ? "min-h-[72vh] sm:min-h-[85vh]" : "min-h-[70vh] sm:min-h-[90vh]",
        )}
      >
        <Image
          src={image}
          alt={alt}
          fill
          sizes={size === "full" ? "100vw" : "50vw"}
          style={{ objectPosition: position }}
          className="-z-20 object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <ForegroundFrond className={size === "full" ? "-left-24 -bottom-32 w-[46%]" : "-right-20 -top-24 w-[70%] rotate-[160deg]"} />

        <h2 className="font-display text-[clamp(2.6rem,6vw,5rem)] leading-none">{title}</h2>
        {meta && <p className="mt-5 text-sm tracking-[0.18em] uppercase opacity-90">{meta}</p>}
        <span className="link-underline mt-6 text-lg">{cta}</span>
      </Link>
    </Reveal>
  )
}

/** Fronda scura e sfocata in primo piano, come una foglia davanti all'obiettivo. */
function ForegroundFrond({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 400 400" className={cn("pointer-events-none absolute -z-10 opacity-80 blur-[10px]", className)}>
      <g fill="#04140c">
        <path d="M40 380 C 120 300, 220 200, 380 30 C 300 160, 190 280, 60 395 Z" />
        {Array.from({ length: 11 }, (_, i) => {
          const t = (i + 1) / 12
          const x = 40 + 340 * t
          const y = 380 - 350 * t
          const s = 70 * (1 - t) + 20
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <ellipse cx={-s * 0.5} cy={-s * 0.15} rx={s * 0.6} ry={s * 0.14} transform="rotate(-70)" />
              <ellipse cx={s * 0.5} cy={s * 0.15} rx={s * 0.6} ry={s * 0.14} transform="rotate(20)" />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

/** Testata delle pagine interne: foto a tutto schermo, titolo centrato. */
export function PageHero({ title, subtitle, image, alt, position = "center" }: { title: string; subtitle?: string; image: string; alt: string; position?: string }) {
  return (
    <section className="relative isolate flex h-[72svh] min-h-[480px] items-center justify-center overflow-hidden px-5 text-center text-[#f6efe0]">
      <Image src={image} alt={alt} fill priority sizes="100vw" style={{ objectPosition: position }} className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/30 to-background" />
      <div>
        <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-none">{title}</h1>
        {subtitle && <p className="mx-auto mt-6 max-w-xl text-lg text-[#f6efe0]/85">{subtitle}</p>}
      </div>
    </section>
  )
}
