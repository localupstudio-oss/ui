/**
 * Dati anagrafici del locale.
 *
 * ✔ = verificato (post/locandine Instagram @ryococktailbar)
 * ✎ = segnaposto da sostituire prima della messa in produzione
 */
export const site = {
  /** Quando `true` le sezioni con contenuti dimostrativi mostrano un badge "Demo". */
  demo: true,

  name: "RYO",
  fullName: "RYO Cocktail Bar & Bistro",
  claim: "Churrascaria · Tapas · Cocktail", // ✔ dalle locandine di ottobre 2026
  description:
    "Luxury cocktail bar & bistro nel cuore di Cava de' Tirreni: mixology d'autore, cucina da condividere e serate esclusive in un'atmosfera tropicale.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ryococktailbar.it", // ✎ dominio definitivo
  locale: "it_IT",

  address: {
    street: "Corso Umberto I, 1", // ✔ locandine
    zip: "84013",
    city: "Cava de' Tirreni",
    province: "SA",
    country: "IT",
  },
  phone: "+39 329 697 4492", // ✔ schede pubbliche (da riconfermare)
  whatsapp: "393296974492", // ✔ numero WhatsApp Business
  email: "info@ryococktailbar.it", // ✔

  social: {
    instagram: "https://www.instagram.com/ryococktailbar/", // ✔
    tiktok: "https://www.tiktok.com/@ryococktailbar", // ✔
    facebook: "https://www.facebook.com/profile.php?id=61553488403054", // ✔
  },

  /** ✔ Orari ufficiali (ottobre 2026). Periodi di chiusura volutamente non indicati. */
  hours: [
    { days: "Lunedì", value: "Chiuso" },
    { days: "Martedì", value: "Chiuso" },
    { days: "Mercoledì", value: "18:30 – 01:00" },
    { days: "Giovedì", value: "18:30 – 03:00" },
    { days: "Venerdì", value: "18:30 – 03:00" },
    { days: "Sabato", value: "18:30 – 03:00" },
    { days: "Domenica", value: "18:30 – 01:00" },
  ],
  /** ✔ La cucina chiude sempre a mezzanotte. */
  kitchenCloses: "00:00",
  /** Giorni di chiusura (0 = domenica … 6 = sabato) usati anche dalla validazione prenotazioni. */
  closedWeekdays: [1, 2],

  company: {
    legalName: "Rigo Services S.r.l.", // ✔
    vat: "05981510653", // ✔
    rea: "SA-488417", // ✔
    legalSeat: "Corso Mazzini, 39 – 84013 Cava de' Tirreni (SA)", // ✔ sede legale
    legalRep: "Franco De Felicis", // ✔ rappresentante legale
  },
} as const

/**
 * I menu in PDF, aperti dalla schermata /menu (e dal menu a tendina). `href` assente = in arrivo.
 * `image` è la copertina che compare a fianco quando il cliente passa sul nome.
 * ✎ copertine provvisorie per Combo e Dessert; le altre sono definitive.
 */
export const menus: { label: string; sub: string; href?: string; image: string; alt: string }[] = [
  { label: "À la carte", sub: "Tapas, platos, ensaladas, primi, carnes e sides", href: "/menu/ryo-menu-alacarte.pdf", image: "/images/menu/alacarte.jpg", alt: "Si versa il vino bianco su una tavola di tacos, tapas e calamari" },
  { label: "Churrasco", sub: "Degustazione alla brace · 38 €", href: "/menu/ryo-menu-churrasco.pdf", image: "/images/cucina/churrasco-spiedo.jpg", alt: "Il passador taglia la picanha dallo spiedo" },
  { label: "Combo", sub: "In arrivo", image: "/images/home/cibo-bowl-tapas.jpg", alt: "Bowl, riso e tapas da condividere" },
  { label: "Dessert", sub: "Tiramiryo, Bananito, babbà e il dolce della settimana", href: "/menu/ryo-menu-dessert.pdf", image: "/images/galleria/dessert-frutta.jpg", alt: "Un dessert alla frutta" },
  { label: "Cocktail", sub: "Cocktails d'autore e analcolici", href: "/menu/ryo-drink-list.pdf", image: "/images/menu/cocktail-highball.jpg", alt: "Un highball rosa con scorza d'arancia tra foglie di felce" },
  { label: "Wine", sub: "In arrivo", image: "/images/menu/wine.jpg", alt: "Si versa il vino rosso nel calice accanto al pannello intagliato" },
]

export const nav = [
  { href: "/menu", label: "Menu" },
  { href: "/serate", label: "Le serate" },
  { href: "/eventi", label: "Eventi privati" },
  { href: "/contatti", label: "Location & contatti" },
] as const

export const whatsappUrl = (text = "Ciao RYO! Vorrei prenotare un tavolo") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`

export const fullAddress = `${site.address.street}, ${site.address.zip} ${site.address.city} (${site.address.province})`

/**
 * Messaggi WhatsApp precompilati: il cliente trova già la richiesta scritta e
 * completa solo i campi dopo i due punti.
 */
export type EventKind = "compleanno" | "privato" | "aziendale" | "altro"

/** Intestazione e campi del messaggio WhatsApp per ogni serata della settimana. */
const NIGHT_WA: Record<string, { emoji: string; text: (title: string) => string }> = {
  Mercoledì: { emoji: "🌿", text: () => "un tavolo per mercoledì" },
  Giovedì: { emoji: "🎤", text: (t) => `un tavolo cena per «${t}» di giovedì` },
  Venerdì: { emoji: "🎶", text: (t) => `un tavolo per «${t}» di venerdì` },
  Sabato: { emoji: "🔥", text: (t) => `la «${t}» di sabato` },
  Domenica: { emoji: "🌴", text: () => "un tavolo per domenica" },
}

/** Messaggio di apertura e campi da completare per ogni tipo di evento privato. */
export const EVENT_WA: Record<EventKind, { emoji: string; intro: string; fields: string[] }> = {
  compleanno: { emoji: "🎂", intro: "Vorrei organizzare un compleanno da voi.", fields: ["Data", "Numero di ospiti", "Anni che si festeggiano", "Torta o allestimento", "Nome"] },
  privato: { emoji: "🎉", intro: "Vorrei organizzare una festa privata da voi (laurea, anniversario, addio al celibato/nubilato…).", fields: ["Data", "Numero di ospiti", "Occasione", "Nome"] },
  aziendale: { emoji: "💼", intro: "Vorrei organizzare una cena aziendale da voi.", fields: ["Azienda", "Data", "Numero di ospiti", "Menu (churrasco / à la carte)", "Nome e ruolo"] },
  altro: { emoji: "✨", intro: "Vorrei organizzare un evento da voi.", fields: ["Data", "Numero di ospiti", "Tipo di evento", "Nome"] },
}

/**
 * Messaggi WhatsApp precompilati: il cliente trova già la richiesta scritta e
 * completa solo i campi dopo i due punti. Uno diverso per ogni tipo di prenotazione.
 */
export const waMessage = {
  tavolo: () =>
    "Ciao RYO! 🍽️ Vorrei prenotare un tavolo.\n\nGiorno: \nOrario: \nNumero di persone: \nNome: \n\nGrazie!",
  serata: (title: string, day: string) => {
    const n = NIGHT_WA[day] ?? { emoji: "👋", text: () => `un tavolo per «${title}»` }
    return `Ciao RYO! ${n.emoji} Vorrei prenotare ${n.text(title)}.\n\nData: \nNumero di persone: \nOrario di arrivo: \nNome: \n\nGrazie!`
  },
  evento: (kind: EventKind = "privato") => {
    const e = EVENT_WA[kind]
    return `Ciao RYO! ${e.emoji} ${e.intro}\n\n${e.fields.map((f) => `${f}: `).join("\n")}\n\nAspetto vostre notizie, grazie!`
  },
}
