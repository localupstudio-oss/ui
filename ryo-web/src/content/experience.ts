/**
 * Serate, abbinamenti, recensioni, traguardi e parcheggi.
 * ✎ DEMO: orari, line-up, statistiche e recensioni sono segnaposto
 * strutturati: sostituirli con i dati reali (le recensioni vanno copiate da
 * Google/TripAdvisor con il consenso degli autori, oppure caricate via API).
 */

export type Night = {
  day: "Giovedì" | "Venerdì" | "Sabato"
  title: string
  mood: string
  time: string
  lineup: string[]
  dressCode: string
  highlight: string
  image: string
  /** Sezione di approfondimento, se esiste. */
  href?: string
}

export const nights: Night[] = [
  {
    day: "Giovedì",
    title: "Quelli che il Giovedì",
    mood: "Si cena, si canta al microfono che gira tra i tavoli e si balla tutti insieme.", // ✔ concept reale
    time: "Dalle 20:30", // ✎ da confermare
    lineup: ["Karaoke tra i tavoli", "Cena e musica live"], // ✎ presentatore/cantante da confermare
    dressCode: "Libero",
    highlight: "Cena + karaoke + festa",
    image: "/images/giovedi/cantano-al-tavolo.jpg",
    href: "#giovedi",
  },
  {
    day: "Venerdì",
    title: "DJ Set & Lounge",
    mood: "Deep, funky e house: la giungla si accende.",
    time: "22:00 – 02:00",
    lineup: ["Lefty DJ", "Omen DJ"],
    dressCode: "Elegante",
    highlight: "This is RYO Weekend",
    image: "/images/eventi/bancone-scimmia.jpg",
  },
  {
    day: "Sabato",
    title: "Premium Exclusive Night",
    mood: "Tavoli riservati, bottle service e drink special in edizione limitata.",
    time: "22:00 – 02:00",
    lineup: ["Guest DJ da annunciare"],
    dressCode: "Elegante — no sportswear",
    highlight: "Prenotazione consigliata",
    image: "/images/locale/sala-giungla.jpg",
  },
]

export type Pairing = {
  dish: { name: string; image: string }
  drink: { name: string; image: string }
  synergy: string
  notes: string[]
}

export const pairings: Pairing[] = [
  {
    dish: { name: "Paella de marisco", image: "/images/cucina/paella.jpg" },
    drink: { name: "Jungle Rose", image: "/images/drink/highball-rosa.jpg" },
    synergy:
      "Le bollicine e l'acidità del pompelmo puliscono il palato dalla sapidità del mare, l'ibisco richiama lo zafferano.",
    notes: ["Acidità", "Effervescenza", "Floreale"],
  },
  {
    dish: { name: "Tartare tropicale", image: "/images/cucina/tartare.jpg" },
    drink: { name: "Green Stem", image: "/images/drink/calice-stelo-verde.jpg" },
    synergy:
      "Il sambuco esalta la dolcezza del mango, il pepe rosa accompagna la delicatezza del crudo senza coprirla.",
    notes: ["Agrumato", "Erbaceo", "Speziato leggero"],
  },
  {
    dish: { name: "RYO Burger", image: "/images/cucina/burger.jpg" },
    drink: { name: "Negroni RYO", image: "/images/drink/bicchiere-ryo.jpg" },
    synergy:
      "L'amaro del bitter bilancia la grassezza del bacon e del formaggio fuso: un contrasto che rinfresca a ogni morso.",
    notes: ["Amaro", "Contrasto", "Struttura"],
  },
  {
    dish: { name: "Fritto & salse", image: "/images/cucina/fritto-e-drink.jpg" },
    drink: { name: "Old Fashioned", image: "/images/drink/ambrato-on-the-rocks.jpg" },
    synergy:
      "Le note caramellate del whisky e la scorza d'arancia si sposano con la doratura croccante della frittura.",
    notes: ["Tostato", "Agrumato", "Morbido"],
  },
]

export type Review = { author: string; source: "Google" | "TripAdvisor"; rating: 5; text: string; date: string }

/** ✎ DEMO — testi di esempio, NON recensioni reali. */
export const reviews: Review[] = [
  { author: "Ospite di esempio", source: "Google", rating: 5, date: "2026", text: "Atmosfera unica, sembra di cenare in una giungla elegante. Cocktail bilanciati e personale attento." },
  { author: "Ospite di esempio", source: "TripAdvisor", rating: 5, date: "2026", text: "La paella da condividere e un Negroni perfetto: serata riuscitissima, torneremo per il DJ set." },
  { author: "Ospite di esempio", source: "Google", rating: 5, date: "2026", text: "Signature creativi e presentazioni curate nei minimi dettagli. Il miglior cocktail bar della zona." },
  { author: "Ospite di esempio", source: "Google", rating: 5, date: "2026", text: "Abbiamo festeggiato un compleanno nella sala: organizzazione impeccabile dall'inizio alla fine." },
]

/** ✎ DEMO — numeri di esempio. */
export const stats = [
  { value: 40, suffix: "+", label: "Signature cocktail creati" },
  { value: 120, suffix: "+", label: "Serate ed eventi esclusivi" },
  { value: 5, suffix: "", label: "Sere di apertura a settimana" },
  { value: 4.8, suffix: "★", label: "Valutazione media ospiti", decimals: 1 },
] as const

export type Parking = { name: string; type: string; walk: string; note: string }

/** ✎ DEMO — da verificare sul posto (nomi, tariffe e distanze reali). */
export const parkings: Parking[] = [
  { name: "Parcheggio A", type: "Multipiano a pagamento", walk: "≈ 4 min a piedi", note: "Aperto fino a tarda sera" },
  { name: "Parcheggio B", type: "Strisce blu", walk: "≈ 6 min a piedi", note: "Gratuito dopo le 20:00 (da verificare)" },
  { name: "Stazione FS Cava de' Tirreni", type: "Treno", walk: "≈ 8 min a piedi", note: "Linea Salerno – Napoli" },
]

export const directions = [
  { from: "Da Salerno / Napoli (A3)", text: "Uscita Cava de' Tirreni, proseguire verso il centro storico e seguire le indicazioni per Corso Umberto I." },
  { from: "In treno", text: "Dalla stazione di Cava de' Tirreni, pochi minuti a piedi verso il centro e i portici del Corso." },
  { from: "A piedi", text: "RYO è nel centro storico, lungo i caratteristici portici di Corso Umberto I." },
]

/** "Quelli che il Giovedì" — serata reale del giovedì (prima edizione: ottobre 2026). */
export const thursday = {
  name: "Quelli che il Giovedì",
  logo: "/images/giovedi/logo-quelli-che-il-giovedi.png",
  claim: "Cena, canta, balla. Tutti insieme.",
  intro:
    "Il giovedì da RYO è una festa a tavola: si cena tra felci e lampade in rattan, il microfono passa di mano in mano tra i tavoli e la serata finisce a ballare tutti insieme.",
  moments: [
    { title: "Cena", text: "Piatti da condividere e calici di vino al tavolo, sotto le luci calde della sala." },
    { title: "Canta", text: "Il microfono gira tra i tavoli: chi vuole canta, tutti gli altri fanno il coro." },
    { title: "Balla", text: "Quando si alza la musica, la sala diventa una pista." },
  ],
  /** ✎ da confermare con il locale */
  details: [
    { label: "Quando", value: "Ogni giovedì" },
    { label: "Inizio", value: "Dalle 20:30" },
    { label: "Prenotazione", value: "Consigliata" },
  ],
  gallery: [
    { src: "/images/giovedi/microfono-tavola.jpg", alt: "Il microfono della serata appoggiato sul menu tropicale di RYO", tall: true },
    { src: "/images/giovedi/microfoni-menu.jpg", alt: "I microfoni della serata accanto al menu cucina di RYO", tall: true },
    { src: "/images/giovedi/tavolata.jpg", alt: "Una tavolata di amici sotto le lampade in rattan", wide: true },
    { src: "/images/giovedi/festa-al-tavolo.jpg", alt: "Un'ospite festeggia a braccia alzate durante la cena", tall: true },
    { src: "/images/giovedi/calici-microfono.jpg", alt: "Calici e microfono della serata sul tavolo", tall: true },
    { src: "/images/giovedi/brindisi.jpg", alt: "Brindisi a tavola con i calici di vino", tall: true },
    { src: "/images/giovedi/cantano-al-tavolo.jpg", alt: "Ospiti che cantano al microfono a tavola tra le canne di bambù", tall: true },
    { src: "/images/giovedi/karaoke.jpg", alt: "Un'ospite canta al microfono in mezzo alla sala", wide: true },
  ],
} as const
