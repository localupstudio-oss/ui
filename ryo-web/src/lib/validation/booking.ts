import { z } from "zod"

import { site } from "@/content/site"

// La CSP vieta eval/new Function: niente compilazione JIT degli schemi (evita il probe `Function("")`).
z.config({ jitless: true })

/** Schema condiviso client/server: la stessa regola valida il form nel browser e nella Server Action. */

export const TIME_SLOTS = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"] as const
export const ZONES = { vip: "Area VIP", bancone: "Bancone", sala: "Sala" } as const
export const EVENT_TYPES = { compleanno: "Compleanno", aziendale: "Evento aziendale", privato: "Festa privata", altro: "Altro" } as const

const todayInRome = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date()) // YYYY-MM-DD

const weekday = (isoDate: string) => new Date(`${isoDate}T12:00:00Z`).getUTCDay()

const futureDate = z.iso
  .date("Seleziona una data valida")
  .refine((d) => d >= todayInRome(), "La data non può essere nel passato")
  .refine((d) => d <= addMonths(todayInRome(), 6), "Accettiamo prenotazioni fino a 6 mesi")

const contact = {
  name: z
    .string()
    .trim()
    .min(2, "Inserisci nome e cognome")
    .max(80, "Massimo 80 caratteri")
    .regex(/^[\p{L}\s'.-]+$/u, "Usa solo lettere, spazi e apostrofi"),
  email: z.email("Email non valida").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s().-]{7,20}$/, "Numero di telefono non valido"),
  notes: z.string().trim().max(500, "Massimo 500 caratteri").optional().default(""),
  privacy: z.literal("on", "Devi accettare l'informativa privacy"),
  /** Honeypot anti-bot: deve restare vuoto. */
  website: z.string().max(0).optional(),
}

export const tableBookingSchema = z.object({
  kind: z.literal("tavolo"),
  ...contact,
  date: futureDate.refine(
    (d) => !(site.closedWeekdays as readonly number[]).includes(weekday(d)),
    "Siamo chiusi il lunedì e il martedì",
  ),
  time: z.enum(TIME_SLOTS, "Seleziona un orario"),
  guests: z.coerce.number("Numero ospiti non valido").int().min(1, "Minimo 1 ospite").max(12, "Per più di 12 ospiti usa il modulo eventi"),
  zone: z.enum(Object.keys(ZONES) as [keyof typeof ZONES, ...(keyof typeof ZONES)[]], "Seleziona una zona"),
})

export const privateEventSchema = z.object({
  kind: z.literal("evento"),
  ...contact,
  date: futureDate,
  eventType: z.enum(Object.keys(EVENT_TYPES) as [keyof typeof EVENT_TYPES, ...(keyof typeof EVENT_TYPES)[]], "Seleziona il tipo di evento"),
  guests: z.coerce.number("Numero ospiti non valido").int().min(10, "Minimo 10 ospiti").max(200, "Massimo 200 ospiti"),
  company: z.string().trim().max(120).optional().default(""),
})

export const bookingSchema = z.discriminatedUnion("kind", [tableBookingSchema, privateEventSchema])
export type BookingInput = z.infer<typeof bookingSchema>

export type FieldErrors = Partial<Record<string, string[]>>
export type BookingState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: FieldErrors }
  | { status: "success"; message: string; whatsappUrl?: string }

export function validateBooking(data: unknown) {
  const result = bookingSchema.safeParse(data)
  if (result.success) return { ok: true as const, data: result.data }
  return { ok: false as const, fieldErrors: z.flattenError(result.error).fieldErrors as FieldErrors }
}

function addMonths(isoDate: string, months: number) {
  const d = new Date(`${isoDate}T12:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString().slice(0, 10)
}
