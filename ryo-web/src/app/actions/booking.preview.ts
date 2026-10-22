import { whatsappUrl } from "@/content/site"
import { summarizeBooking } from "@/lib/booking-summary"
import { validateBooking, type BookingState } from "@/lib/validation/booking"

/**
 * Variante per la BOZZA statica (npm run build:preview): nessun server, quindi
 * stessa validazione Zod nel browser e invio del riepilogo via WhatsApp.
 * Sostituisce `./booking` tramite alias in next.config.ts solo in modalità anteprima.
 */
export async function submitBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const raw = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>
  if (raw.website) return { status: "success", message: "Richiesta ricevuta." }
  const parsed = validateBooking(raw)
  if (!parsed.ok) return { status: "error", message: "Controlla i campi evidenziati.", fieldErrors: parsed.fieldErrors }
  return {
    status: "success",
    message: "Dati verificati. Per completare la richiesta invia il riepilogo su WhatsApp.",
    whatsappUrl: whatsappUrl(summarizeBooking(parsed.data)),
  }
}
