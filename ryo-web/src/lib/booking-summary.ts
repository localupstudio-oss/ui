import { site } from "@/content/site"
import { EVENT_TYPES, ZONES, type BookingInput } from "@/lib/validation/booking"

/** Riepilogo testuale della richiesta (webhook, WhatsApp). */
export function summarizeBooking(b: BookingInput) {
  const lines =
    b.kind === "tavolo"
      ? [`Prenotazione tavolo — ${site.name}`, `Data: ${b.date} ore ${b.time}`, `Ospiti: ${b.guests}`, `Zona: ${ZONES[b.zone]}`]
      : [`Richiesta evento privato — ${site.name}`, `Tipo: ${EVENT_TYPES[b.eventType]}`, `Data: ${b.date}`, `Ospiti: ${b.guests}`, b.company && `Azienda: ${b.company}`]
  return [...lines, `Nome: ${b.name}`, `Tel: ${b.phone}`, `Email: ${b.email}`, b.notes && `Note: ${b.notes}`].filter(Boolean).join("\n")
}
