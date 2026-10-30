"use client"

import Image from "next/image"
import { useActionState, useState } from "react"
import { CheckCircle2, ChevronDown, Loader2, MessageCircle } from "lucide-react"

import { submitBooking } from "@/app/actions/booking"
import { EVENT_WA, site, waMessage, whatsappUrl, type EventKind } from "@/content/site"
import { EVENT_GUESTS_MAX, validateBooking, type BookingState, type FieldErrors } from "@/lib/validation/booking"
import { cn } from "@/lib/utils"

const KINDS: EventKind[] = ["compleanno", "privato", "aziendale"]
const LABEL: Record<string, string> = { compleanno: "Compleanno", privato: "Festa privata", aziendale: "Cena aziendale" }

/** Feste ed eventi privati: una foto e un solo modulo, con la scelta del tipo di evento. */
export function EventEnquiry() {
  const [kind, setKind] = useState<EventKind>("compleanno")
  return (
    <section className="pattern-croci grid grid-cols-1 lg:min-h-[100svh] lg:grid-cols-2">
      <div className="relative h-[42svh] lg:h-auto">
        <Image src="/images/eventi/festa-torta.jpg" alt="Una festa da RYO con torta e fontane di luce" fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />
      </div>
      <div className="flex justify-center px-5 pt-12 pb-16 sm:px-10 lg:pt-32 lg:pb-20">
        <div className="w-full max-w-[540px]">
          <h1 className="font-display text-[clamp(2.3rem,4vw,3.3rem)] leading-tight text-[#f6efe0]">Feste ed eventi privati</h1>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-foreground/75">
            Compleanni, feste private e cene aziendali fino a {EVENT_GUESTS_MAX} ospiti, con menu, allestimento e musica pensati per te. Compila il modulo
            oppure{" "}
            <a href={whatsappUrl(waMessage.evento(kind))} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 underline underline-offset-4">
              <MessageCircle className="size-4" /> scrivici su WhatsApp
            </a>
            .
          </p>
          <EventForm kind={kind} onKind={setKind} />
          <p className="mt-10 text-sm text-foreground/60">
            Preferisci parlarne a voce? Chiamaci al{" "}
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="link-underline">
              {site.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

const initial: BookingState = { status: "idle" }
const box =
  "w-full rounded-none border-0 bg-[#f6efe0] px-4 py-4 text-[1.02rem] text-ink placeholder:text-ink/55 outline-none ring-amber/70 transition focus:ring-2"

/** Modulo dell'evento: una volta inviato, apre WhatsApp con la richiesta già compilata per quel tipo di festa. */
function EventForm({ kind, onKind }: { kind: EventKind; onKind: (k: EventKind) => void }) {
  const [state, action, pending] = useActionState(submitBooking, initial)
  const [first, setFirst] = useState("")
  const [last, setLast] = useState("")
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  const errors: FieldErrors = { ...(state.status === "error" ? state.fieldErrors : {}), ...clientErrors }
  const id = (n: string) => `evento-${n}`

  if (state.status === "success") {
    return (
      <div role="status" className="mt-10 flex flex-col items-start gap-4 border-t border-foreground/15 pt-10">
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
    <form action={action} onSubmit={onSubmit} onInput={() => Object.keys(clientErrors).length && setClientErrors({})} noValidate className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4">
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
      <Field label="Tipo di evento" error={err("eventType")} wide>
        <span className="relative block">
          <select name="eventType" value={kind} onChange={(e) => onKind(e.target.value as EventKind)} className={cn(box, "appearance-none pr-10")}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {EVENT_WA[k].emoji} {LABEL[k]}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink/70" />
        </span>
      </Field>
      {kind === "aziendale" && (
        <Field label="Azienda" error={err("company")} wide>
          <input name="company" placeholder="Azienda" autoComplete="organization" maxLength={120} className={box} />
        </Field>
      )}
      <Field label="Email*" error={err("email")}>
        <input name="email" type="email" placeholder="Email*" autoComplete="email" maxLength={120} aria-invalid={!!err("email") || undefined} className={box} />
      </Field>
      <Field label="Telefono*" error={err("phone")}>
        <input name="phone" type="tel" placeholder="Telefono*" autoComplete="tel" maxLength={20} aria-invalid={!!err("phone") || undefined} className={box} />
      </Field>
      <Field label="Numero di ospiti*" error={err("guests")}>
        <input name="guests" type="number" inputMode="numeric" min={10} max={EVENT_GUESTS_MAX} placeholder={`Ospiti* (max ${EVENT_GUESTS_MAX})`} aria-invalid={!!err("guests") || undefined} className={box} />
      </Field>
      <Field label="Data dell'evento*" error={err("date")}>
        <input name="date" type="date" aria-invalid={!!err("date") || undefined} className={cn(box, "[color-scheme:light]")} />
      </Field>
      <Field label="Informazioni aggiuntive" error={err("notes")} wide>
        <textarea name="notes" rows={3} maxLength={500} placeholder="Informazioni aggiuntive (torta, musica, menu, allergie…)" className={cn(box, "resize-none")} />
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
