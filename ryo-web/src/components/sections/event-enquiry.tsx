"use client"

import Image from "next/image"
import Link from "next/link"
import { useActionState, useState } from "react"
import { CheckCircle2, ChevronDown, Loader2, MessageCircle } from "lucide-react"

import { submitBooking } from "@/app/actions/booking"
import { EVENT_WA, site, waMessage, whatsappUrl, type EventKind } from "@/content/site"
import { EVENT_TYPES, validateBooking, type BookingState, type FieldErrors } from "@/lib/validation/booking"
import { cn } from "@/lib/utils"

type Occasion = { kind: EventKind; title: string; text: string[]; image: string; alt: string; company?: boolean }

/** Le tre modalità di festa privata, ognuna con la sua sezione (foto + testo + modulo). */
const occasions: Occasion[] = [
  {
    kind: "compleanno",
    title: "Compleanni",
    text: [
      "Festa dei 18, dei 30 o dei 40 anni, o semplicemente la tua: da RYO il compleanno diventa una serata tra tapas, churrasco e cocktail d'autore, con torta, musica e il tavolo riservato sotto le felci.",
      "Ci occupiamo noi dell'allestimento e del menu, da 10 a 200 ospiti.",
    ],
    image: "/images/eventi/festa-torta.jpg",
    alt: "Una festa di compleanno da RYO con torta e fontane di luce",
  },
  {
    kind: "privato",
    title: "Feste private",
    text: [
      "Lauree, anniversari, addii al celibato e al nubilato, rimpatriate tra amici: costruiamo la serata intorno a te, dalla cena fino al dopocena in musica.",
      "La sala si adatta al tuo gruppo, anche in esclusiva per le occasioni più grandi.",
    ],
    image: "/images/giovedi/festa-al-tavolo.jpg",
    alt: "Amici che festeggiano a tavola",
  },
  {
    kind: "aziendale",
    title: "Cene aziendali",
    text: [
      "Cene di team, presentazioni, brindisi di fine anno e incontri con i clienti: un menu dedicato o la Churrasco Experience, con un servizio curato dall'inizio alla fine.",
      "Prepariamo preventivo e menu su misura per la tua azienda.",
    ],
    image: "/images/giovedi/tavolata.jpg",
    alt: "Una lunga tavolata da RYO",
    company: true,
  },
]

export function EventEnquiry() {
  return (
    <div className="pattern-croci">
      {occasions.map((o, i) => (
        <OccasionSection key={o.kind} occasion={o} flip={i % 2 === 1} first={i === 0} />
      ))}
      <p className="px-5 py-16 text-center text-sm text-foreground/70">
        Preferisci parlarne a voce? Chiamaci al{" "}
        <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="link-underline">
          {site.phone}
        </a>
      </p>
    </div>
  )
}

function OccasionSection({ occasion: o, flip, first }: { occasion: Occasion; flip: boolean; first: boolean }) {
  return (
    <section id={o.kind} className="grid grid-cols-1 lg:min-h-[100svh] lg:grid-cols-2">
      {/* foto: metà schermo, ferma mentre si compila il modulo */}
      <div className={cn("relative h-[58svh] lg:sticky lg:top-0 lg:h-[100svh]", flip && "lg:order-2")}>
        <Image src={o.image} alt={o.alt} fill priority={first} sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />
      </div>
      <div className={cn("flex justify-center px-5 py-16 sm:px-10 lg:py-36", flip && "lg:order-1")}>
        <div className="w-full max-w-[560px]">
          <h2 className="font-display text-[clamp(2.4rem,4vw,3.4rem)] leading-tight text-[#f6efe0]">{o.title}</h2>
          {o.text.map((t) => (
            <p key={t} className="mt-6 text-[1.05rem] leading-relaxed text-foreground/75">
              {t}
            </p>
          ))}
          <p className="mt-6 text-[1.05rem] leading-relaxed text-foreground/75">
            Per informazioni e preventivi compila il modulo qui sotto, oppure scrivici direttamente su WhatsApp:
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/menu" className="rounded-full border border-foreground/80 px-7 py-3 transition-colors hover:bg-foreground hover:text-background">
              Vedi i menu
            </Link>
            <a
              href={whatsappUrl(waMessage.evento(o.kind))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/80 px-7 py-3 transition-colors hover:bg-foreground hover:text-background"
            >
              <MessageCircle className="size-4" /> Scrivici su WhatsApp
            </a>
          </div>
          <EventForm occasion={o} />
        </div>
      </div>
    </section>
  )
}

const initial: BookingState = { status: "idle" }
const box =
  "w-full rounded-none border-0 bg-[#f6efe0] px-4 py-4 text-[1.02rem] text-ink placeholder:text-ink/55 outline-none ring-amber/70 transition focus:ring-2"

/** Modulo dell'evento: una volta inviato, apre WhatsApp con la richiesta già compilata per quel tipo di festa. */
function EventForm({ occasion: o }: { occasion: Occasion }) {
  const [state, action, pending] = useActionState(submitBooking, initial)
  const [first, setFirst] = useState("")
  const [last, setLast] = useState("")
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  const errors: FieldErrors = { ...(state.status === "error" ? state.fieldErrors : {}), ...clientErrors }
  const id = (n: string) => `${o.kind}-${n}`

  if (state.status === "success") {
    return (
      <div role="status" className="mt-12 flex flex-col items-start gap-4 border-t border-foreground/15 pt-10">
        <CheckCircle2 className="size-10 text-leaf" />
        <p className="font-display text-3xl text-[#f6efe0]">Ci siamo quasi!</p>
        <p className="text-foreground/75">{state.message}</p>
        {state.whatsappUrl && (
          <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 rounded-full bg-[#25d366] px-8 py-3.5 font-medium text-[#062e16] transition-colors hover:bg-[#3ee07a]">
            <MessageCircle className="size-5" /> Invia la richiesta su WhatsApp
          </a>
        )}
      </div>
    )
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const result = validateBooking(Object.fromEntries(new FormData(e.currentTarget)))
    const errs: FieldErrors = result.ok ? {} : { ...result.fieldErrors }
    if (!first.trim()) errs.first = ["Inserisci il nome"]
    if (!last.trim()) errs.last = ["Inserisci il cognome"]
    if (errs.name && !errs.first && !errs.last) errs.first = errs.name
    setClientErrors(errs)
    if (Object.keys(errs).length) {
      e.preventDefault()
      e.currentTarget.querySelector<HTMLElement>("[aria-invalid=true]")?.focus()
    }
  }

  const err = (k: string) => errors[k]?.[0]

  return (
    <form action={action} onSubmit={onSubmit} onInput={() => Object.keys(clientErrors).length && setClientErrors({})} noValidate className="mt-12 grid grid-cols-2 gap-x-4 gap-y-5">
      <input type="hidden" name="kind" value="evento" />
      <input type="hidden" name="name" value={`${first.trim()} ${last.trim()}`.trim()} />
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Sito web <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Nome*" error={err("first")}>
        <input id={id("first")} value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Nome*" autoComplete="given-name" maxLength={40} aria-invalid={!!err("first") || undefined} className={box} />
      </Field>
      <Field label="Cognome*" error={err("last")}>
        <input id={id("last")} value={last} onChange={(e) => setLast(e.target.value)} placeholder="Cognome*" autoComplete="family-name" maxLength={40} aria-invalid={!!err("last") || undefined} className={box} />
      </Field>
      <Field label="Azienda" error={err("company")} wide>
        <input name="company" placeholder={o.company ? "Azienda" : "Azienda (facoltativo)"} autoComplete="organization" maxLength={120} className={box} />
      </Field>
      <Field label="Email*" error={err("email")} wide>
        <input name="email" type="email" placeholder="Email*" autoComplete="email" maxLength={120} aria-invalid={!!err("email") || undefined} className={box} />
      </Field>
      <Field label="Telefono*" error={err("phone")} wide>
        <input name="phone" type="tel" placeholder="Telefono*" autoComplete="tel" maxLength={20} aria-invalid={!!err("phone") || undefined} className={box} />
      </Field>
      <Field label="Numero di ospiti*" error={err("guests")}>
        <input name="guests" type="number" inputMode="numeric" min={10} max={200} placeholder="Numero di ospiti*" aria-invalid={!!err("guests") || undefined} className={box} />
      </Field>
      <Field label="Data dell'evento*" error={err("date")}>
        <input name="date" type="date" aria-invalid={!!err("date") || undefined} className={cn(box, "[color-scheme:light]")} />
      </Field>
      <Field label="Tipo di evento" error={err("eventType")} wide>
        <span className="relative block">
          <select name="eventType" defaultValue={o.kind} className={cn(box, "appearance-none pr-10")}>
            {(Object.keys(EVENT_TYPES) as EventKind[]).map((k) => (
              <option key={k} value={k}>
                {EVENT_WA[k].emoji} {EVENT_TYPES[k]}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink/70" />
        </span>
      </Field>
      <Field label="Informazioni aggiuntive" error={err("notes")} wide>
        <textarea name="notes" rows={6} maxLength={500} placeholder="Informazioni aggiuntive (torta, musica, menu, allergie…)" className={cn(box, "resize-none")} />
      </Field>

      <label className="col-span-2 flex items-start gap-3 text-sm text-foreground/75">
        <input type="checkbox" name="privacy" className="mt-0.5 size-4 accent-[var(--amber)]" />
        <span>
          Accetto l&apos;<a href="/privacy" className="underline underline-offset-4">informativa privacy</a>
        </span>
      </label>
      {err("privacy") && <p className="col-span-2 -mt-3 text-sm text-orange">{err("privacy")}</p>}
      {state.status === "error" && (
        <p role="alert" className="col-span-2 text-sm text-orange">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="col-span-2 inline-flex items-center justify-center gap-2 justify-self-start rounded-full bg-[#f6efe0] px-10 py-4 text-ink transition-colors hover:bg-white disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Invia la richiesta
      </button>
    </form>
  )
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={cn("grid gap-1.5", wide ? "col-span-2" : "col-span-2 sm:col-span-1")}>
      <span className="sr-only">{label}</span>
      {children}
      {error && <span className="text-sm text-orange">{error}</span>}
    </label>
  )
}
