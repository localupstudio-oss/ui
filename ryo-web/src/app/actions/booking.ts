"use server"

import { headers } from "next/headers"

import { site, whatsappUrl } from "@/content/site"
import { rateLimit } from "@/lib/rate-limit"
import { EVENT_TYPES, ZONES, validateBooking, type BookingInput, type BookingState } from "@/lib/validation/booking"

const ALLOWED_FIELDS = [
  "kind", "name", "email", "phone", "notes", "privacy", "website",
  "date", "time", "guests", "zone", "eventType", "company",
] as const

export async function submitBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  // Solo i campi attesi, solo stringhe: niente file o chiavi arbitrarie.
  const raw: Record<string, string> = {}
  for (const key of ALLOWED_FIELDS) {
    const v = formData.get(key)
    if (typeof v === "string") raw[key] = v.slice(0, 1000)
  }

  // Honeypot compilato → bot. Risposta neutra per non dare indizi.
  if (raw.website) return { status: "success", message: "Richiesta ricevuta." }

  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  const limited = rateLimit(`booking:${ip}`)
  if (!limited.ok) {
    return { status: "error", message: "Troppe richieste ravvicinate. Riprova tra qualche minuto o scrivici su WhatsApp." }
  }

  const parsed = validateBooking(raw)
  if (!parsed.ok) {
    return { status: "error", message: "Controlla i campi evidenziati.", fieldErrors: parsed.fieldErrors }
  }

  const summary = summarize(parsed.data)
  const delivered = await deliver(parsed.data, summary)

  if (delivered) {
    return {
      status: "success",
      message: parsed.data.kind === "tavolo"
        ? "Richiesta inviata! Ti confermeremo il tavolo via telefono o email."
        : "Richiesta inviata! Il nostro event manager ti contatterà entro 24 ore.",
    }
  }

  // Nessun canale configurato: l'ospite conferma via WhatsApp con il riepilogo già pronto.
  return {
    status: "success",
    message: "Dati verificati. Per completare la prenotazione invia il riepilogo su WhatsApp.",
    whatsappUrl: whatsappUrl(summary),
  }
}

function summarize(b: BookingInput) {
  const lines =
    b.kind === "tavolo"
      ? [`Prenotazione tavolo — ${site.name}`, `Data: ${b.date} ore ${b.time}`, `Ospiti: ${b.guests}`, `Zona: ${ZONES[b.zone]}`]
      : [`Richiesta evento privato — ${site.name}`, `Tipo: ${EVENT_TYPES[b.eventType]}`, `Data: ${b.date}`, `Ospiti: ${b.guests}`, b.company && `Azienda: ${b.company}`]
  return [...lines, `Nome: ${b.name}`, `Tel: ${b.phone}`, `Email: ${b.email}`, b.notes && `Note: ${b.notes}`].filter(Boolean).join("\n")
}

/**
 * Invia la richiesta al gestionale/CRM/email tramite webhook (es. Make, Zapier, n8n, endpoint interno).
 * Configurare BOOKING_WEBHOOK_URL (+ opzionale BOOKING_WEBHOOK_SECRET) nelle variabili d'ambiente.
 */
async function deliver(data: BookingInput, summary: string) {
  const url = process.env.BOOKING_WEBHOOK_URL
  if (!url) {
    if (process.env.NODE_ENV !== "production") console.info("[booking] webhook non configurato\n" + summary)
    return false
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.BOOKING_WEBHOOK_SECRET && { Authorization: `Bearer ${process.env.BOOKING_WEBHOOK_SECRET}` }),
      },
      body: JSON.stringify({ ...data, privacy: true, website: undefined, summary, receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    })
    return res.ok
  } catch (err) {
    console.error("[booking] invio fallito", err)
    return false
  }
}
