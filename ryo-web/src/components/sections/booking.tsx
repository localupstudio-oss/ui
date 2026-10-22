"use client"

import Image from "next/image"
import { useActionState, useRef, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Loader2, MessageCircle, PartyPopper } from "lucide-react"

import { submitBooking } from "@/app/actions/booking"
import { experiences, type Experience } from "@/content/experience"
import { site, whatsappUrl } from "@/content/site"
import { formatDate, nightOf } from "@/lib/booking-summary"
import { addMonths, EVENT_TYPES, GUESTS_MAX, TIME_SLOTS, todayInRome, validateBooking, weekday, type BookingState, type FieldErrors } from "@/lib/validation/booking"
import { cn } from "@/lib/utils"

type Mode = "tavolo" | "evento"

const initial: BookingState = { status: "idle" }
const noopSubscribe = () => () => {}
const closed = site.closedWeekdays as readonly number[]

/**
 * Modulo "Prenota un tavolo" sul modello dei grandi ristoranti: calendario a giorni tondi,
 * persone + orario + Prenota, poi i dati di contatto. Sotto, le serate della settimana
 * e le feste private: ogni scheda preimposta il calendario o apre la richiesta evento.
 */
export function Booking({ defaultTab = "tavolo" }: { defaultTab?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultTab)
  const [date, setDate] = useState<string>()
  const [eventType, setEventType] = useState<string>()
  // Ogni nuova scelta dall'esterno (scheda serata, cambio modulo) ricrea il form da zero.
  const [formKey, setFormKey] = useState(0)
  const widgetRef = useRef<HTMLDivElement>(null)
  // "Oggi" (ora di Roma) solo nel browser: il prerender non dipende dalla data di build.
  const today = useSyncExternalStore(noopSubscribe, todayInRome, () => null)

  function switchMode(next: Mode, type?: string) {
    setMode(next)
    setEventType(type)
    setFormKey((k) => k + 1)
    widgetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function pickExperience(e: Experience) {
    if (e.weekday === undefined) return switchMode("evento", "compleanno")
    if (today) setDate(nextWeekday(today, e.weekday))
    if (mode !== "tavolo") setMode("tavolo")
    setFormKey((k) => k + 1)
    widgetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section id="prenota" className="cream-surface border-t border-ink/10 py-24 sm:py-32">
      <div ref={widgetRef} className="mx-auto max-w-3xl scroll-mt-24 px-5 text-center sm:px-8">
        <h2 className="font-display text-[clamp(2.6rem,6vw,4.4rem)] leading-none">
          {mode === "tavolo" ? "Prenota un tavolo" : "Feste ed eventi"}
        </h2>
        <p className="mx-auto mt-7 max-w-[60ch] text-[0.95rem] leading-relaxed text-ink/75">
          {mode === "tavolo" ? (
            <>
              Siamo aperti dal mercoledì alla domenica e accettiamo prenotazioni fino a 6 mesi in anticipo, per tavoli fino a {GUESTS_MAX} persone.
              La prenotazione è confermata dal nostro staff via WhatsApp o telefono. Per gruppi più numerosi, compleanni e feste usa «Feste ed eventi».
            </>
          ) : (
            <>
              Compleanni, feste dei 30 anni, lauree e cene aziendali da 10 a 200 ospiti. Raccontaci la tua idea: ti ricontattiamo con menu,
              allestimento e preventivo su misura.
            </>
          )}
        </p>

        <div className="mt-12 text-left">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${mode}-${formKey}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {mode === "tavolo" ? (
                <TableBooking today={today} date={date} onDate={setDate} onGroup={() => switchMode("evento")} onReset={() => setFormKey((k) => k + 1)} />
              ) : (
                <EventBooking today={today} date={date} onDate={setDate} defaultType={eventType} onReset={() => setFormKey((k) => k + 1)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 rounded-full border border-ink px-6 py-3.5 transition-colors hover:bg-ink hover:text-cream"
          >
            <MessageCircle className="size-4" /> Scrivici su WhatsApp
          </a>
          <button
            type="button"
            onClick={() => switchMode(mode === "tavolo" ? "evento" : "tavolo")}
            className="inline-flex items-center justify-center gap-2.5 rounded-full border border-ink px-6 py-3.5 transition-colors hover:bg-ink hover:text-cream"
          >
            {mode === "tavolo" ? <><PartyPopper className="size-4" /> Feste ed eventi</> : "Prenota un tavolo"}
          </button>
        </div>
        <p className="mt-5 text-sm text-ink/65">
          Oppure chiamaci al <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="link-underline">{site.phone}</a>
        </p>
      </div>

      <Experiences onPick={pickExperience} />
    </section>
  )
}

/* ───────────────────────── Tavolo: due passi ───────────────────────── */

type FlowProps = { today: string | null; date?: string; onDate: (d: string) => void; onReset: () => void }

function TableBooking({ today, date, onDate, onGroup, onReset }: FlowProps & { onGroup: () => void }) {
  const [state, formAction, pending] = useActionState(submitBooking, initial)
  const [step, setStep] = useState<1 | 2>(1)
  const [guests, setGuests] = useState("2")
  const [time, setTime] = useState("")
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  const errors: FieldErrors = { ...(state.status === "error" ? state.fieldErrors : {}), ...clientErrors }
  const night = date ? nightOf(date) : undefined

  if (state.status === "success") return <Success state={state} onReset={onReset} />

  function next() {
    const errs: FieldErrors = {}
    if (!date) errs.date = ["Scegli un giorno dal calendario"]
    if (!time) errs.time = ["Scegli un orario"]
    setClientErrors(errs)
    if (!Object.keys(errs).length) setStep(2)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const result = validateBooking(Object.fromEntries(new FormData(e.currentTarget)))
    if (result.ok) return setClientErrors({})
    e.preventDefault()
    setClientErrors(result.fieldErrors)
    if (result.fieldErrors.date || result.fieldErrors.time || result.fieldErrors.guests) setStep(1)
    else e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(result.fieldErrors)[0]}"]`)?.focus()
  }

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate>
      <input type="hidden" name="kind" value="tavolo" />
      <input type="hidden" name="date" value={date ?? ""} />
      <input type="hidden" name="time" value={time} />
      <input type="hidden" name="guests" value={guests} />
      <Honeypot />

      {step === 1 ? (
        <div className="grid grid-cols-1 gap-8">
          <div>
            <Calendar today={today} value={date} onChange={(d) => { onDate(d); setClientErrors({}) }} isClosed={(d) => closed.includes(weekday(d))} />
            <p className="mt-4 min-h-6 text-center text-sm text-ink/75" aria-live="polite">
              {date && (
                <>
                  <span>{cap(formatDate(date))}</span>
                  {night && <> · <span className="font-display text-base italic">{night.title}</span></>}
                </>
              )}
            </p>
            <ErrorText errors={errors.date} center />
          </div>

          <div className="grid grid-cols-1 items-end gap-5 sm:grid-cols-[1fr_1fr_auto]">
            <SelectField
              label="Numero di persone"
              id="tavolo-guests"
              value={guests}
              onChange={(v) => (v === "gruppo" ? onGroup() : setGuests(v))}
              error={errors.guests}
            >
              {Array.from({ length: GUESTS_MAX }, (_, i) => (
                <option key={i} value={i + 1}>{i + 1} {i ? "persone" : "persona"}</option>
              ))}
              <option value="gruppo">Più di {GUESTS_MAX} · feste ed eventi</option>
            </SelectField>
            <SelectField label="Orario" id="tavolo-time" value={time} onChange={(v) => { setTime(v); setClientErrors({}) }} error={errors.time}>
              <option value="" disabled>Scegli</option>
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </SelectField>
            <button type="button" onClick={next} className="h-12 rounded-full bg-ink px-10 text-cream transition-colors hover:bg-green">
              Prenota
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-ink/20 py-4 sm:col-span-2">
            <p>
              <span className="font-display text-xl">{date && cap(formatDate(date))}</span>
              <span className="mt-1 block text-sm text-ink/70">
                ore {time} · {guests} {guests === "1" ? "persona" : "persone"}{night && ` · ${night.title}`}
              </span>
            </p>
            <button type="button" onClick={() => setStep(1)} className="link-underline text-sm">Modifica</button>
          </div>
          <ContactFields prefix="tavolo" errors={errors} notesPlaceholder="Allergie, occasioni speciali, seggiolone…" />
          <FormFooter state={state} errors={errors} pending={pending} label="Conferma la prenotazione" />
        </div>
      )}
    </form>
  )
}

/* ───────────────────────── Feste ed eventi privati ───────────────────────── */

function EventBooking({ today, date, onDate, defaultType, onReset }: FlowProps & { defaultType?: string }) {
  const [state, formAction, pending] = useActionState(submitBooking, initial)
  const [eventType, setEventType] = useState(defaultType ?? "")
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  const errors: FieldErrors = { ...(state.status === "error" ? state.fieldErrors : {}), ...clientErrors }

  if (state.status === "success") return <Success state={state} onReset={onReset} />

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const result = validateBooking(Object.fromEntries(new FormData(e.currentTarget)))
    if (result.ok) return setClientErrors({})
    e.preventDefault()
    setClientErrors(result.fieldErrors)
    e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(result.fieldErrors)[0]}"]`)?.focus()
  }

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <input type="hidden" name="kind" value="evento" />
      <input type="hidden" name="date" value={date ?? ""} />
      <Honeypot />

      <div className="sm:col-span-2">
        {/* Le feste si possono organizzare anche nei giorni di chiusura, su richiesta. */}
        <Calendar today={today} value={date} onChange={onDate} isClosed={() => false} />
        <p className="mt-4 min-h-6 text-center text-sm text-ink/75" aria-live="polite">{date && cap(formatDate(date))}</p>
        <ErrorText errors={errors.date} center />
      </div>

      <SelectField label="Tipo di evento" id="evento-type" name="eventType" value={eventType} onChange={setEventType} error={errors.eventType}>
        <option value="" disabled>Seleziona</option>
        {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </SelectField>
      <TextField label="Numero di ospiti" id="evento-guests" name="guests" type="number" inputMode="numeric" min={10} max={200} defaultValue={30} error={errors.guests} />
      <ContactFields prefix="evento" errors={errors} notesPlaceholder="Es. festa dei 30 anni, torta, musica, menu churrasco…" company />
      <FormFooter state={state} errors={errors} pending={pending} label="Invia la richiesta" />
    </form>
  )
}

/* ───────────────────────── Calendario ───────────────────────── */

const WEEKDAYS = ["L", "M", "M", "G", "V", "S", "D"]
const monthLabel = (ym: string) =>
  new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym}-15T12:00:00Z`))
const shiftMonth = (ym: string, n: number) => addMonths(`${ym}-15`, n).slice(0, 7)
const pad = (n: number) => String(n).padStart(2, "0")

function Calendar({ today, value, onChange, isClosed }: { today: string | null; value?: string; onChange: (d: string) => void; isClosed: (d: string) => boolean }) {
  const [view, setView] = useState<string | null>(null)
  const [prevValue, setPrevValue] = useState(value)
  // Se la data cambia dall'esterno (scheda serata), il calendario salta al mese giusto.
  if (value !== prevValue) {
    setPrevValue(value)
    if (value) setView(value.slice(0, 7))
  }

  if (!today) return <div className="mx-auto h-[392px] max-w-md" aria-hidden />

  const month = view ?? (value ?? today).slice(0, 7)
  const max = addMonths(today, 6)
  const [y, m] = month.split("-").map(Number)
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7 // lunedì = 0

  return (
    <div className="mx-auto max-w-md">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Mese precedente"
          disabled={month <= today.slice(0, 7)}
          onClick={() => setView(shiftMonth(month, -1))}
          className="grid size-10 place-items-center rounded-full transition-colors hover:bg-ink/10 disabled:opacity-25 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="font-display text-2xl" aria-live="polite">{cap(monthLabel(month))}</p>
        <button
          type="button"
          aria-label="Mese successivo"
          disabled={month >= max.slice(0, 7)}
          onClick={() => setView(shiftMonth(month, 1))}
          className="grid size-10 place-items-center rounded-full transition-colors hover:bg-ink/10 disabled:opacity-25 disabled:hover:bg-transparent"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div role="grid" aria-label={monthLabel(month)} className="mt-5 grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} role="columnheader" className="pb-2 text-xs font-medium tracking-widest text-ink/55">{d}</span>
        ))}
        {Array.from({ length: offset }, (_, i) => <span key={`x${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const iso = `${month}-${pad(i + 1)}`
          const disabled = iso < today || iso > max || isClosed(iso)
          const selected = iso === value
          return (
            <span key={iso} role="gridcell" className="grid place-items-center">
              <button
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={`${formatDate(iso)}${disabled ? " — non disponibile" : ""}`}
                aria-current={iso === today ? "date" : undefined}
                onClick={() => onChange(iso)}
                className={cn(
                  "grid size-10 place-items-center rounded-full text-[0.95rem] tabular-nums transition-colors sm:size-11",
                  selected ? "bg-ink text-cream" : "hover:bg-ink/10",
                  iso === today && !selected && "ring-1 ring-ink ring-inset",
                  disabled && "cursor-not-allowed text-ink/25 hover:bg-transparent",
                )}
              >
                {i + 1}
              </button>
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ───────────────────────── Le nostre serate ───────────────────────── */

function Experiences({ onPick }: { onPick: (e: Experience) => void }) {
  return (
    <div className="mx-auto mt-28 max-w-[1400px] px-5 sm:px-10">
      <h3 className="text-center text-sm font-medium tracking-[0.3em] text-ink/70 uppercase">Le nostre serate</h3>
      <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {experiences.map((e) => (
          <li key={e.key} className="flex flex-col">
            <button type="button" onClick={() => onPick(e)} className="group relative aspect-[4/5] overflow-hidden text-left" aria-label={`${e.title}: ${e.weekday === undefined ? "richiedi informazioni" : "prenota"}`}>
              <Image src={e.image} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover object-top transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
              {e.soon && (
                <span className="absolute top-4 left-4 rounded-full bg-cream px-3 py-1 text-xs font-medium tracking-wide">Novità in arrivo</span>
              )}
            </button>
            <p className="mt-6 text-xs font-medium tracking-[0.25em] text-ink/60 uppercase">{e.label}</p>
            <h4 className="mt-2 font-display text-3xl">{e.title}</h4>
            <p className="mt-3 flex-1 leading-relaxed text-ink/75">{e.text}</p>
            <button
              type="button"
              onClick={() => onPick(e)}
              className="mt-6 self-start rounded-full border border-ink px-7 py-3 text-sm transition-colors hover:bg-ink hover:text-cream"
            >
              {e.weekday === undefined ? "Organizza la tua festa" : `Prenota ${e.weekday === 0 ? "la" : "il"} ${e.label.toLowerCase()}`}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ───────────────────────── Campi ───────────────────────── */

const fieldCls =
  "h-12 w-full rounded-none border-0 border-b border-ink/35 bg-transparent px-0 text-base text-ink placeholder:text-ink/40 outline-none transition-colors focus:border-ink in-data-invalid:border-orange"

function ContactFields({ prefix, errors, notesPlaceholder, company }: { prefix: string; errors: FieldErrors; notesPlaceholder: string; company?: boolean }) {
  return (
    <>
      <TextField label="Nome e cognome" id={`${prefix}-name`} name="name" autoComplete="name" maxLength={80} error={errors.name} className="sm:col-span-2" />
      <TextField label="Telefono" id={`${prefix}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={20} placeholder="+39" error={errors.phone} />
      <TextField label="Email" id={`${prefix}-email`} name="email" type="email" autoComplete="email" maxLength={120} error={errors.email} />
      {company && <TextField label="Azienda (facoltativo)" id={`${prefix}-company`} name="company" autoComplete="organization" maxLength={120} error={errors.company} className="sm:col-span-2" />}
      <div className="grid gap-2 sm:col-span-2" data-invalid={!!errors.notes?.length || undefined}>
        <label htmlFor={`${prefix}-notes`} className="text-sm text-ink/70">Note (facoltativo)</label>
        <textarea id={`${prefix}-notes`} name="notes" rows={2} maxLength={500} placeholder={notesPlaceholder} className={cn(fieldCls, "h-auto resize-none py-3")} />
        <ErrorText errors={errors.notes} />
      </div>
    </>
  )
}

function TextField({ label, id, error, className, ...props }: { label: string; id: string; error?: string[]; className?: string } & React.ComponentProps<"input">) {
  return (
    <div className={cn("grid gap-2", className)} data-invalid={!!error?.length || undefined}>
      <label htmlFor={id} className="text-sm text-ink/70">{label}</label>
      <input id={id} required aria-invalid={!!error?.length || undefined} className={fieldCls} {...props} />
      <ErrorText errors={error} />
    </div>
  )
}

function SelectField({ label, id, name, value, onChange, error, children }: { label: string; id: string; name?: string; value: string; onChange: (v: string) => void; error?: string[]; children: React.ReactNode }) {
  return (
    <div className="grid gap-2" data-invalid={!!error?.length || undefined}>
      <label htmlFor={id} className="text-sm text-ink/70">{label}</label>
      <div className="relative">
        <select id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error?.length || undefined} className={cn(fieldCls, "cursor-pointer appearance-none pr-8")}>
          {children}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-ink/60" />
      </div>
      <ErrorText errors={error} />
    </div>
  )
}

function FormFooter({ state, errors, pending, label }: { state: BookingState; errors: FieldErrors; pending: boolean; label: string }) {
  return (
    <>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-ink/75">
          <input type="checkbox" name="privacy" required className="mt-0.5 size-4 accent-[var(--ink)]" />
          <span>
            Ho letto l&apos;<a href="/privacy" className="underline underline-offset-4">informativa privacy</a> e acconsento al trattamento dei dati per gestire la richiesta.
          </span>
        </label>
        <ErrorText errors={errors.privacy} />
      </div>
      <AnimatePresence>
        {state.status === "error" && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="border border-orange/50 bg-orange/10 px-4 py-3 text-sm text-[#8a4423] sm:col-span-2">
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>
      <button type="submit" disabled={pending} className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-ink px-10 text-cream transition-colors hover:bg-green disabled:opacity-60 sm:col-span-2">
        {pending && <Loader2 className="size-4 animate-spin" />} {label}
      </button>
    </>
  )
}

function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
      <label>
        Sito web <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}

function Success({ state, onReset }: { state: Extract<BookingState, { status: "success" }>; onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center border-y border-ink/20 py-14 text-center" role="status">
      <CheckCircle2 className="size-14 text-green" />
      <p className="mt-5 font-display text-4xl">Grazie!</p>
      <p className="mt-3 max-w-sm text-ink/75">{state.message}</p>
      {state.whatsappUrl && (
        <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-[#25d366] px-8 py-3.5 font-medium text-[#062e16] transition-colors hover:bg-[#3ee07a]">
          <MessageCircle className="size-5" /> Conferma su WhatsApp
        </a>
      )}
      <button type="button" onClick={onReset} className="link-underline mt-6 text-sm">Nuova prenotazione</button>
    </motion.div>
  )
}

function ErrorText({ errors, center }: { errors?: string[]; center?: boolean }) {
  if (!errors?.length) return null
  return <p className={cn("text-sm text-[#a5481f]", center && "text-center")} role="alert">{errors[0]}</p>
}

/** Prima data (oggi compreso) che cade nel giorno della settimana indicato. */
function nextWeekday(fromIso: string, wd: number) {
  const d = new Date(`${fromIso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + ((wd - d.getUTCDay() + 7) % 7))
  return d.toISOString().slice(0, 10)
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
