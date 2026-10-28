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
  whatsapp: "393296974492", // ✎ sostituire con il numero WhatsApp Business quando disponibile
  email: "info@ryococktailbar.it", // ✎

  social: {
    instagram: "https://www.instagram.com/ryococktailbar/", // ✔
    tiktok: "", // ✎ inserire URL
    facebook: "", // ✎ inserire URL
  },

  /** ✔ "Aperti dal mercoledì alla domenica" — orari esatti ✎ */
  hours: [
    { days: "Lunedì", value: "Chiuso" },
    { days: "Martedì", value: "Chiuso" },
    { days: "Mercoledì", value: "19:00 – 01:00" },
    { days: "Giovedì", value: "19:00 – 01:00" },
    { days: "Venerdì", value: "19:00 – 02:00" },
    { days: "Sabato", value: "19:00 – 02:00" },
    { days: "Domenica", value: "19:00 – 01:00" },
  ],
  /** Giorni di chiusura (0 = domenica … 6 = sabato) usati anche dalla validazione prenotazioni. */
  closedWeekdays: [1, 2],

  company: {
    legalName: "Ragione sociale S.r.l.", // ✎
    vat: "IT00000000000", // ✎
    rea: "SA-000000", // ✎
  },
} as const

/** I menu in PDF, aperti dal menu a tendina e dalla pagina /menu. `href` assente = in arrivo. */
export const menus: { label: string; sub: string; href?: string }[] = [
  { label: "À la carte", sub: "Tapas, platos, ensaladas, primi, carnes e sides", href: "/menu/ryo-menu-alacarte.pdf" },
  { label: "Churrasco", sub: "Degustazione alla brace · 38 €", href: "/menu/ryo-menu-churrasco.pdf" },
  { label: "Combo", sub: "In arrivo" },
  { label: "Dessert", sub: "Tiramiryo, Bananito, babbà e il dolce della settimana", href: "/menu/ryo-menu-dessert.pdf" },
  { label: "Cocktail", sub: "Cocktails d'autore e analcolici", href: "/menu/ryo-drink-list.pdf" },
  { label: "Wine", sub: "In arrivo" },
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
export const waMessage = {
  tavolo: () =>
    "Ciao RYO! 👋 Vorrei prenotare un tavolo.\n\nGiorno: \nOrario: \nNumero di persone: \nNome: \n\nGrazie!",
  serata: (title: string, day: string) =>
    `Ciao RYO! 👋 Vorrei prenotare un tavolo per «${title}» (${day.toLowerCase()}).\n\nData: \nNumero di persone: \nOrario di arrivo: \nNome: \n\nGrazie!`,
  evento: (tipo = "una festa privata") =>
    `Ciao RYO! 🎉 Vorrei organizzare ${tipo} da voi.\n\nData: \nNumero di ospiti: \nOccasione (es. compleanno, 30 anni, laurea): \nNome: \nIdee o richieste particolari: \n\nAspetto vostre notizie, grazie!`,
}
