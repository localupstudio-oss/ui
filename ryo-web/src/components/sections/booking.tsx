"use client"

import { useActionState, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Loader2, MessageCircle, PartyPopper } from "lucide-react"

import { submitBooking } from "@/app/actions/booking"
import { site, waMessage, whatsappUrl } from "@/content/site"
import { formatDate, nightOf } from "@/lib/booking-summary"
import { addMonths, GUESTS_MAX, TIME_SLOTS, todayInRome, validateBooking, weekday, type BookingState, type FieldErrors } from "@/lib/validation/booking"
import { cn } from "@/lib/utils"

const initial: BookingState = { status: "idle" }
const noopSubscribe = () => () => {}
const closed = site.closedWeekdays as readonly number[]

/**
 * Prenotazione del tavolo, mostrata nella finestra che si apre dai pulsanti "Prenota"
 * (e sulla pagina /prenota): prima la via più rapida, WhatsApp con il messaggio già
 * scritto; poi il modulo con calendario a giorni tondi, persone, orario e contatti.
 * Feste ed eventi vanno direttamente in chat con un messaggio dedicato.
 */
export function BookingPanel({ titleId }: { titleId?: string }) {
  const [date, setDate] = useState<string>()
  const [formKey, setFormKey] = useState(0)
  // "Oggi" (ora di Roma) solo nel browser: il prerender non dipende dalla data di build.
  const today = useSyncExternalStore(noopSubscribe, todayInRome, () => null)
  const eventUrl = whatsappUrl(waMessage.evento())

  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 id={titleId} className="font-display text-[clamp(2.3rem,6vw,3.8rem)] leading-none">Prenota un tavolo</h2>
      <p className="mx-auto mt-5 max-w-[56ch] text-[0.95rem] leading-relaxed text-ink/75">
        Siamo aperti dal mercoledì alla domenica. Scrivici su WhatsApp con il messaggio già pronto, oppure scegli giorno, orario e persone qui sotto:
        ti confermiamo noi il tavolo.
      </p>

      <a
        href={whatsappUrl(waMessage.tavolo())}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25d366] px-8 py-4 font-medium text-[#062e16] transition-colors hover:bg-[#3ee07a]"
      >
        <MessageCircle className="size-5" /> Prenota su WhatsApp
      </a>

      <div className="my-10 flex items-center gap-4 text-xs tracking-[0.25em] text-ink/50 uppercase">
        <span className="h-px flex-1 bg-ink/15" /> oppure con il modulo <span className="h-px flex-1 bg-ink/15" />
      </div>

      <div className="text-left">
        <TableBooking key={formKey} today={today} date={date} onDate={setDate} onGroup={() => window.open(eventUrl, "_blank", "noopener")} onReset={() => setFormKey((k) => k + 1)} />
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 border-t border-ink/15 pt-8 text-sm text-ink/70">
        <p>Più di {GUESTS_MAX} persone, una festa o un compleanno?</p>
        <a
          href={eventUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-full border border-ink px-6 py-3 text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          <PartyPopper className="size-4" /> Organizza il tuo evento su WhatsApp
        </a>
        <p>
          Oppure chiamaci al <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="link-underline">{site.phone}</a>
        </p>
      </div>
    </div>
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

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
