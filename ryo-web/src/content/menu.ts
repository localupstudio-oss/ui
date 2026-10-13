/**
 * Menu Food / Drink / Drink Special.
 * ✎ DEMO: nomi dei signature, descrizioni, prezzi e allergeni sono dimostrativi:
 * vanno sostituiti con il menu ufficiale del locale.
 * Le immagini sono foto reali di RYO.
 */

/** I 14 allergeni del Reg. UE 1169/2011. */
export const ALLERGENS = {
  glutine: "Glutine",
  crostacei: "Crostacei",
  uova: "Uova",
  pesce: "Pesce",
  arachidi: "Arachidi",
  soia: "Soia",
  latte: "Latte",
  fruttaGuscio: "Frutta a guscio",
  sedano: "Sedano",
  senape: "Senape",
  sesamo: "Sesamo",
  solfiti: "Solfiti",
  lupini: "Lupini",
  molluschi: "Molluschi",
} as const

export type Allergen = keyof typeof ALLERGENS

export type MenuItem = {
  id: string
  name: string
  description: string
  ingredients: string[]
  price: number
  allergens: Allergen[]
  image?: string
  tags?: ("signature" | "veg" | "da condividere" | "novità" | "analcolico")[]
}

export type MenuCategory = { id: string; label: string; items: MenuItem[] }

export const foodMenu: MenuCategory[] = [
  {
    id: "crudi",
    label: "Crudi & Starter",
    items: [
      {
        id: "tartare",
        name: "Tartare tropicale",
        description: "Battuto al coltello, mango, crumble croccante e basilico.",
        ingredients: ["Pescato del giorno", "Mango", "Crumble di pane", "Basilico", "Lime"],
        price: 18,
        allergens: ["pesce", "glutine"],
        image: "/images/cucina/tartare.jpg",
        tags: ["signature"],
      },
      {
        id: "tacos",
        name: "Tacos RYO",
        description: "Tortilla morbida, crudo di tonno, pomodoro, guacamole.",
        ingredients: ["Tortilla di mais", "Tonno", "Pomodoro", "Avocado", "Cipolla rossa"],
        price: 14,
        allergens: ["pesce"],
        image: "/images/cucina/tacos-e-vino.jpg",
        tags: ["da condividere"],
      },
      {
        id: "calamari",
        name: "Frittura di calamari",
        description: "Anelli croccanti serviti su foglia, maionese al lime.",
        ingredients: ["Calamari", "Semola", "Lime", "Maionese"],
        price: 13,
        allergens: ["molluschi", "glutine", "uova"],
        image: "/images/galleria/calamari.jpg",
        tags: ["da condividere"],
      },
    ],
  },
  {
    id: "piatti",
    label: "Piatti",
    items: [
      {
        id: "paella",
        name: "Paella de marisco",
        description: "Riso bomba, cozze, vongole, gamberi e lime. Per due persone.",
        ingredients: ["Riso bomba", "Cozze", "Vongole", "Gamberi", "Zafferano", "Lime"],
        price: 42,
        allergens: ["crostacei", "molluschi", "sedano"],
        image: "/images/cucina/paella.jpg",
        tags: ["signature", "da condividere"],
      },
      {
        id: "burger",
        name: "RYO Burger",
        description: "Bun brioche, manzo, bacon croccante, formaggio fuso, patate rustiche.",
        ingredients: ["Manzo", "Bacon", "Formaggio", "Bun brioche", "Patate"],
        price: 17,
        allergens: ["glutine", "latte", "uova", "sesamo"],
        image: "/images/cucina/burger.jpg",
      },
      {
        id: "bowl",
        name: "Bowl mediterranea",
        description: "Verdure grigliate, tonno, cipolla in agrodolce, pane croccante.",
        ingredients: ["Melanzane", "Zucchine", "Tonno", "Cipolla rossa", "Pane"],
        price: 15,
        allergens: ["pesce", "glutine"],
        image: "/images/cucina/bowl-verdure.jpg",
      },
    ],
  },
  {
    id: "insalate",
    label: "Insalate",
    items: [
      {
        id: "salmone",
        name: "Salmone & agrumi",
        description: "Salmone marinato, arance, finocchio, cavolo rosso, sesamo nero.",
        ingredients: ["Salmone", "Arancia", "Finocchio", "Cavolo rosso", "Sesamo nero"],
        price: 16,
        allergens: ["pesce", "sesamo"],
        image: "/images/cucina/insalata-salmone.jpg",
        tags: ["novità"],
      },
      {
        id: "pollo",
        name: "Pollo grigliato",
        description: "Pollo alla griglia, crostini, pomodorini, scaglie di formaggio.",
        ingredients: ["Pollo", "Crostini", "Pomodorini", "Formaggio stagionato", "Lattuga"],
        price: 15,
        allergens: ["glutine", "latte", "uova"],
        image: "/images/cucina/insalata-pollo.jpg",
      },
    ],
  },
  {
    id: "dolci",
    label: "Dolci",
    items: [
      {
        id: "frutta",
        name: "Tropical fruit",
        description: "Frutta esotica, gelato alla vaniglia, riduzione ai frutti rossi.",
        ingredients: ["Mango", "Papaya", "Fragole", "Gelato vaniglia"],
        price: 9,
        allergens: ["latte"],
        image: "/images/galleria/dessert-frutta.jpg",
        tags: ["veg"],
      },
    ],
  },
]

export const drinkMenu: MenuCategory[] = [
  {
    id: "signature",
    label: "Signature",
    items: [
      {
        id: "jungle-rose",
        name: "Jungle Rose",
        description: "Highball floreale e frizzante, profumo d'arancia.",
        ingredients: ["Gin", "Ibisco", "Pompelmo rosa", "Tonica", "Scorza d'arancia"],
        price: 12,
        allergens: [],
        image: "/images/drink/highball-rosa.jpg",
        tags: ["signature"],
      },
      {
        id: "autumn-leaf",
        name: "Autumn Leaf",
        description: "Sour vellutato con schiuma setosa e foglia essiccata.",
        ingredients: ["Bourbon", "Limone", "Miele speziato", "Aquafaba"],
        price: 13,
        allergens: [],
        image: "/images/drink/cocktail-foglia.jpg",
        tags: ["signature"],
      },
      {
        id: "green-stem",
        name: "Green Stem",
        description: "Delicato e agrumato, servito nel calice dallo stelo verde.",
        ingredients: ["Vodka", "Sambuco", "Lime", "Pepe rosa"],
        price: 12,
        allergens: [],
        image: "/images/drink/calice-stelo-verde.jpg",
      },
    ],
  },
  {
    id: "classici",
    label: "Classici",
    items: [
      {
        id: "negroni",
        name: "Negroni RYO",
        description: "Il grande classico, nel bicchiere firmato RYO.",
        ingredients: ["Gin", "Bitter", "Vermouth rosso", "Arancia"],
        price: 11,
        allergens: ["solfiti"],
        image: "/images/drink/bicchiere-ryo.jpg",
      },
      {
        id: "old-fashioned",
        name: "Old Fashioned",
        description: "Whisky, zucchero, angostura e scorza d'arancia.",
        ingredients: ["Bourbon", "Zucchero", "Angostura", "Arancia"],
        price: 11,
        allergens: [],
        image: "/images/drink/ambrato-on-the-rocks.jpg",
      },
    ],
  },
  {
    id: "zero",
    label: "Zero Proof",
    items: [
      {
        id: "velvet",
        name: "Velvet Curtain",
        description: "Analcolico agrumato e aromatico.",
        ingredients: ["Distillato analcolico", "Yuzu", "Basilico", "Soda"],
        price: 9,
        allergens: [],
        image: "/images/drink/cocktail-sipario.jpg",
        tags: ["analcolico"],
      },
    ],
  },
]

export const drinkSpecials: MenuItem[] = [
  {
    id: "special-weekend",
    name: "This is RYO Weekend",
    description:
      "Il drink del weekend creato dal master bartender: cambia ogni settimana, in edizione limitata.",
    ingredients: ["Rum invecchiato", "Ananas arrosto", "Falernum", "Lime", "Bitter al cacao"],
    price: 14,
    allergens: [],
    image: "/images/drink/highball-rosa.jpg",
    tags: ["signature", "novità"],
  },
  {
    id: "special-smoke",
    name: "Smoked Velvet",
    description: "Affumicato al tavolo con legno di ciliegio, servito sotto campana.",
    ingredients: ["Mezcal", "Vermouth", "Amaro", "Fumo di ciliegio"],
    price: 16,
    allergens: ["solfiti"],
    image: "/images/drink/bicchiere-ryo.jpg",
    tags: ["signature"],
  },
]

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value)
