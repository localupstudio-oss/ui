import { experiences } from "@/content/experience"
import { site } from "@/content/site"
import { EVENT_TYPES, weekday, type BookingInput } from "@/lib/validation/booking"

/** Riepilogo testuale della richiesta (webhook, WhatsApp). */
export function summarizeBooking(b: BookingInput) {
  const lines =
    b.kind === "tavolo"
      ? [`Prenotazione tavolo — ${site.name}`, `Data: ${formatDate(b.date)} ore ${b.time}`, `Ospiti: ${b.guests}`, nightOf(b.date) && `Serata: ${nightOf(b.date)?.title}`]
      : [`Richiesta evento privato — ${site.name}`, `Tipo: ${EVENT_TYPES[b.eventType]}`, `Data: ${formatDate(b.date)}`, `Ospiti: ${b.guests}`, b.company && `Azienda: ${b.company}`]
  return [...lines, `Nome: ${b.name}`, `Tel: ${b.phone}`, `Email: ${b.email}`, b.notes && `Note: ${b.notes}`].filter(Boolean).join("\n")
}


/** "2026-10-23" → "venerdì 23 ottobre 2026" */
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`))
}

/** La serata in programma nel giorno della data scelta, se c'è. */
export const nightOf = (iso: string) => experiences.find((e) => e.weekday === weekday(iso))
