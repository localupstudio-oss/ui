"use client"

import { useActionState, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Building2, CheckCircle2, Crown, GlassWater, Loader2, MessageCircle, Sofa } from "lucide-react"

import { submitBooking } from "@/app/actions/booking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { SectionHeading } from "@/components/section-heading"
import { Reveal } from "@/components/motion/reveal"
import { EVENT_TYPES, TIME_SLOTS, ZONES, validateBooking, type BookingState, type FieldErrors } from "@/lib/validation/booking"
import { cn } from "@/lib/utils"

const zoneIcons = { vip: Crown, bancone: GlassWater, sala: Sofa } as const
const initial: BookingState = { status: "idle" }
const noopSubscribe = () => () => {}
const todayIso = () => new Date().toISOString().slice(0, 10)

export function Booking({ defaultTab = "tavolo" }: { defaultTab?: "tavolo" | "evento" }) {
  return (
    <section id="prenota" className="relative overflow-hidden py-28 sm:py-36">
      <div className="jungle-glow absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionHeading
              eyebrow="Prenotazioni & eventi privati"
              title={
                <>
                  Il tuo tavolo <span className="text-hot">ti aspetta.</span>
                </>
              }
              intro="Scegli data, orario e zona preferita. Per compleanni, feste private ed eventi aziendali possiamo riservare l'intero locale o un'area dedicata, con menu e drink list su misura."
            />
          </Reveal>
          <Reveal delay={0.1} className="mt-10 grid grid-cols-1 gap-4">
            {[
              { icon: Crown, title: "Area VIP", text: "Divanetti riservati, bottle service e servizio dedicato." },
              { icon: GlassWater, title: "Bancone", text: "In prima fila davanti ai bartender, per vivere lo show." },
              { icon: Building2, title: "Eventi aziendali", text: "Da 10 a 200 ospiti: aperitivi, cene, lanci di prodotto." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 rounded-sm border border-border bg-card/50 p-5">
                <f.icon className="mt-1 size-5 shrink-0 text-amber" />
                <div>
                  <p className="font-display text-base">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.text}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal delay={0.15} className="lg:col-span-7">
          <div className="rounded-sm border border-amber/25 bg-card/80 p-6 shadow-[0_40px_120px_-40px_rgb(201_162_75/0.35)] backdrop-blur-xl sm:p-10">
            <Tabs defaultValue={defaultTab}>
              <TabsList className="mb-8 grid h-auto w-full grid-cols-2 bg-muted/70 p-1">
                <TabsTrigger value="tavolo" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent">Prenota un tavolo</TabsTrigger>
                <TabsTrigger value="evento" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent">Evento privato</TabsTrigger>
              </TabsList>
              <TabsContent value="tavolo"><BookingForm kind="tavolo" /></TabsContent>
              <TabsContent value="evento"><BookingForm kind="evento" /></TabsContent>
            </Tabs>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function BookingForm({ kind }: { kind: "tavolo" | "evento" }) {
  const [state, formAction, pending] = useActionState(submitBooking, initial)
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  // Data minima calcolata solo nel browser: il prerender statico non dipende dalla data di build.
  const minDate = useSyncExternalStore(noopSubscribe, todayIso, () => undefined)

  const errors: FieldErrors = { ...(state.status === "error" ? state.fieldErrors : {}), ...clientErrors }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const result = validateBooking(data)
    if (!result.ok) {
      e.preventDefault()
      setClientErrors(result.fieldErrors)
      const first = Object.keys(result.fieldErrors)[0]
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
    } else {
      setClientErrors({})
    }
  }

  if (state.status === "success") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12 text-center" role="status">
        <CheckCircle2 className="size-14 text-leaf" />
        <p className="mt-5 font-display text-3xl">Grazie!</p>
        <p className="mt-2 max-w-sm text-muted-foreground">{state.message}</p>
        {state.whatsappUrl && (
          <Button asChild size="lg" className="mt-6 rounded-full bg-[#25d366] text-[#073b1c] hover:bg-[#25d366]/90">
            <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" /> Conferma su WhatsApp
            </a>
          </Button>
        )}
      </motion.div>
    )
  }

  const id = (n: string) => `${kind}-${n}`

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <input type="hidden" name="kind" value={kind} />
      {/* Honeypot: invisibile agli utenti, compilato dai bot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label htmlFor={id("website")}>Sito web</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field label="Nome e cognome" id={id("name")} error={errors.name} className="sm:col-span-2">
        <Input id={id("name")} name="name" autoComplete="name" required maxLength={80} />
      </Field>
      <Field label="Email" id={id("email")} error={errors.email}>
        <Input id={id("email")} name="email" type="email" autoComplete="email" required maxLength={120} />
      </Field>
      <Field label="Telefono" id={id("phone")} error={errors.phone}>
        <Input id={id("phone")} name="phone" type="tel" autoComplete="tel" required maxLength={20} placeholder="+39" />
      </Field>
      <Field label="Data" id={id("date")} error={errors.date}>
        <Input id={id("date")} name="date" type="date" min={minDate} required className="[color-scheme:dark]" />
      </Field>

      {kind === "tavolo" ? (
        <>
          <Field label="Orario" id={id("time")} error={errors.time}>
            <Select name="time">
              <SelectTrigger id={id("time")} className="w-full"><SelectValue placeholder="Scegli l'orario" /></SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Numero ospiti" id={id("guests")} error={errors.guests}>
            <Input id={id("guests")} name="guests" type="number" inputMode="numeric" min={1} max={12} defaultValue={2} required />
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium">Zona preferita</legend>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(ZONES) as (keyof typeof ZONES)[]).map((z, i) => {
                const Icon = zoneIcons[z]
                return (
                  <label key={z} className="group relative cursor-pointer">
                    <input type="radio" name="zone" value={z} defaultChecked={i === 2} className="peer sr-only" />
                    <span className="flex flex-col items-center gap-2 rounded-sm border border-border p-4 text-sm transition-all peer-checked:border-amber peer-checked:bg-amber/10 peer-checked:shadow-[0_0_24px_-8px_var(--amber)] peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:border-foreground/30">
                      <Icon className="size-5 text-amber" />
                      {ZONES[z]}
                    </span>
                  </label>
                )
              })}
            </div>
            <ErrorText errors={errors.zone} />
          </fieldset>
        </>
      ) : (
        <>
          <Field label="Tipo di evento" id={id("eventType")} error={errors.eventType}>
            <Select name="eventType">
              <SelectTrigger id={id("eventType")} className="w-full"><SelectValue placeholder="Seleziona" /></SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Numero ospiti" id={id("guests")} error={errors.guests}>
            <Input id={id("guests")} name="guests" type="number" inputMode="numeric" min={10} max={200} defaultValue={30} required />
          </Field>
          <Field label="Azienda (facoltativo)" id={id("company")} error={errors.company} className="sm:col-span-2">
            <Input id={id("company")} name="company" autoComplete="organization" maxLength={120} />
          </Field>
        </>
      )}

      <Field label="Note (facoltativo)" id={id("notes")} error={errors.notes} className="sm:col-span-2">
        <Textarea id={id("notes")} name="notes" maxLength={500} rows={3} placeholder={kind === "tavolo" ? "Allergie, occasioni speciali…" : "Raccontaci la tua idea di evento"} />
      </Field>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" name="privacy" required className="mt-1 size-4 accent-[var(--amber)]" />
          <span>
            Ho letto l&apos;<a href="/privacy" className="text-amber underline-offset-4 hover:underline">informativa privacy</a> e acconsento al trattamento dei dati per gestire la richiesta.
          </span>
        </label>
        <ErrorText errors={errors.privacy} />
      </div>

      <AnimatePresence>
        {state.status === "error" && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="rounded-xl border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-orange sm:col-span-2">
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" size="lg" disabled={pending} className="h-12 rounded-full text-base font-semibold sm:col-span-2">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {kind === "tavolo" ? "Richiedi la prenotazione" : "Richiedi un preventivo"}
      </Button>
    </form>
  )
}

function Field({ label, id, error, className, children }: { label: string; id: string; error?: string[]; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid grid-cols-1 gap-2", className)} data-invalid={!!error?.length || undefined}>
      <Label htmlFor={id}>{label}</Label>
      <div className="[&_input]:h-11 [&_input]:bg-background/60 [&_[data-slot=select-trigger]]:h-11 [&_[data-slot=select-trigger]]:bg-background/60 [&_textarea]:bg-background/60 in-data-invalid:[&_input]:border-orange">
        {children}
      </div>
      <ErrorText errors={error} />
    </div>
  )
}

function ErrorText({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="text-xs text-orange" role="alert">{errors[0]}</p>
}
