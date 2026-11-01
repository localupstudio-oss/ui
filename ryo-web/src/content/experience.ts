/**
 * Serate, abbinamenti, recensioni, traguardi e parcheggi.
 * ✎ DEMO: orari, line-up, statistiche e recensioni sono segnaposto
 * strutturati: sostituirli con i dati reali (le recensioni vanno copiate da
 * Google/TripAdvisor con il consenso degli autori, oppure caricate via API).
 */

export type Night = {
  /** Indirizzo della pagina della serata: /serate/<slug>. */
  slug: string
  day: "Giovedì" | "Venerdì" | "Sabato"
  title: string
  mood: string
  time?: string
  lineup: string[]
  entry?: string
  highlight: string
  /** Locandina della serata (verticale). */
  image: string
  /** Breve racconto della serata, nella sua pagina. */
  about: string[]
  /** Foto che si alternano nella pagina della serata. */
  photos: { src: string; alt: string }[]
}

/**
 * ✔ Dalle locandine di ottobre 2026. Il sabato è sospeso per ora.
 * ✎ Foto del venerdì provvisorie: sostituirle con quelle della serata (stessa forma { src, alt }).
 */
export const nights: Night[] = [
  {
    slug: "giovedi",
    day: "Giovedì",
    title: "Quelli che il Giovedì",
    mood: "Cena, karaoke tra i tavoli e festa: il Giovedì RYO.",
    time: "Start 21:30",
    lineup: ["DJ set Peter Torre", "Voice Carmine Caudino"],
    entry: "Solo con tavolo cena · cocktail bar",
    highlight: "Si canta, si cena, si balla",
    image: "/images/serate/giovedi-ryo.jpg",
    about: [
      "Il giovedì da RYO è una festa a tavola: si cena tra felci e lampade in rattan, il microfono passa di mano in mano tra i tavoli e la serata finisce a ballare tutti insieme.",
      "Piatti da condividere, cocktail d'autore e la voce di Carmine Caudino con il DJ set di Peter Torre. L'ingresso è riservato a chi cena con noi: prenota il tavolo per esserci.",
    ],
    photos: [
      { src: "/images/giovedi/karaoke.jpg", alt: "Un'ospite canta al microfono in mezzo alla sala" },
      { src: "/images/giovedi/tavolata.jpg", alt: "Una tavolata di amici sotto le lampade in rattan" },
      { src: "/images/giovedi/cantano-al-tavolo.jpg", alt: "Ospiti che cantano al microfono a tavola" },
      { src: "/images/giovedi/festa-al-tavolo.jpg", alt: "Un'ospite festeggia a braccia alzate durante la cena" },
      { src: "/images/giovedi/brindisi.jpg", alt: "Brindisi a tavola con i calici di vino" },
    ],
  },
  {
    slug: "venerdi",
    day: "Venerdì",
    title: "T'immagini",
    mood: "Il venerdì di RYO con Friends Events: nuovo menù e nuova drink list.",
    time: "Start 21:30",
    lineup: ["DJ set Lorenzo Barbarulo", "Friends Events"],
    highlight: "Nuovo menù e nuova drink list",
    image: "/images/serate/venerdi-timmagini.jpg",
    about: [
      "Il venerdì RYO cambia ritmo: con Friends Events la cena diventa festa, tra il nuovo menù, la nuova drink list e il DJ set di Lorenzo Barbarulo.",
      "Arriva per cena e resta per la musica: tavoli, cocktail e la sala che si accende fino a tardi.",
    ],
    photos: [
      { src: "/images/home/pro-dj.jpg", alt: "Il DJ set in sala da RYO" },
      { src: "/images/home/persone-ballo.jpg", alt: "Si balla tra i tavoli da RYO" },
      { src: "/images/home/drink-tiki.jpg", alt: "Un cocktail tiki della drink list" },
      { src: "/images/home/persone-gruppo.jpg", alt: "Un gruppo di amici festeggia da RYO" },
    ],
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
export type Experience = {
  key: "festa" | "mercoledi" | "giovedi" | "venerdi" | "sabato" | "domenica"
  /** Etichetta breve sopra il titolo. */
  label: string
  title: string
  text: string
  image: string
  /** Giorno della settimana preselezionato nel calendario (0 = domenica); assente per le feste. */
  weekday?: number
  /** Segnaposto in attesa dei dettagli dell'evento. */
  soon?: boolean
}

/** Le "esperienze" del modulo di prenotazione: feste private e le serate della settimana. */
export const experiences: Experience[] = [
  {
    key: "festa",
    label: "Su richiesta",
    title: "Feste private & compleanni",
    text: "Festa dei 30 anni, compleanni, lauree e cene di gruppo: menu dedicato, torta, musica e tavolo riservato.",
    image: "/images/giovedi/festa-al-tavolo.jpg",
  },
  {
    key: "mercoledi",
    label: "Mercoledì",
    title: "Il Mercoledì di RYO",
    text: "Si riapre la settimana tra tapas e cocktail. In arrivo una formula speciale per far risparmiare chi viene a trovarci.",
    image: "/images/locale/sala-giungla.jpg",
    weekday: 3,
    soon: true,
  },
  {
    key: "giovedi",
    label: "Giovedì",
    title: "Quelli che il Giovedì",
    text: "Cena, karaoke tra i tavoli e festa. Start 21:30, ingresso solo con tavolo cena.",
    image: "/images/serate/giovedi-ryo.jpg",
    weekday: 4,
  },
  {
    key: "venerdi",
    label: "Venerdì",
    title: "T'immagini",
    text: "Il venerdì con Friends Events e DJ set Lorenzo Barbarulo: nuovo menù e nuova drink list.",
    image: "/images/serate/venerdi-timmagini.jpg",
    weekday: 5,
  },
  {
    key: "sabato",
    label: "Sabato",
    title: "Churrasco Experience",
    text: "4 tapas, 3 contorni e il giro di carne allo spiedo, con il DJ set di Lefty.",
    image: "/images/serate/sabato-churrasco.jpg",
    weekday: 6,
  },
  {
    key: "domenica",
    label: "Domenica",
    title: "La Domenica di RYO",
    text: "Chiudi il weekend con calma, tra brace e cocktail. Anche qui presto una formula pensata per farti risparmiare.",
    image: "/images/locale/bancone.jpg",
    weekday: 0,
    soon: true,
  },
]
