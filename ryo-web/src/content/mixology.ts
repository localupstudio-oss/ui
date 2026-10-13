/** Dati del Mixology Lab 3D: ogni ingrediente sposta colore e profilo aromatico del drink. */

export const FLAVORS = ["Agrumato", "Dolce", "Amaro", "Erbaceo", "Affumicato", "Floreale"] as const
export type Flavor = (typeof FLAVORS)[number]
export type Profile = Record<Flavor, number> // 0..10

export type Ingredient = {
  id: string
  name: string
  color: string
  profile: Partial<Profile>
  note: string
}

export type Garnish = Ingredient & { kind: "orange" | "leaf" | "cherry" | "pepper" }

export const bases: Ingredient[] = [
  { id: "gin", name: "Gin", color: "#e8f1ef", profile: { Erbaceo: 6, Agrumato: 4, Floreale: 3 }, note: "Ginepro e botaniche fresche" },
  { id: "rum", name: "Rum invecchiato", color: "#c7792b", profile: { Dolce: 6, Affumicato: 2, Amaro: 1 }, note: "Melassa, vaniglia, legno tostato" },
  { id: "mezcal", name: "Mezcal", color: "#e9dfc4", profile: { Affumicato: 8, Erbaceo: 3 }, note: "Agave arrostita e fumo" },
  { id: "bourbon", name: "Bourbon", color: "#b5651d", profile: { Dolce: 5, Affumicato: 3, Amaro: 2 }, note: "Caramello, mais e quercia" },
]

export const modifiers: Ingredient[] = [
  { id: "bitter", name: "Bitter rosso", color: "#c0172b", profile: { Amaro: 7, Agrumato: 3 }, note: "Arancia amara e radici" },
  { id: "hibiscus", name: "Sciroppo di ibisco", color: "#e86a9a", profile: { Floreale: 7, Dolce: 4, Agrumato: 2 }, note: "Petali, frutti rossi" },
  { id: "lime", name: "Lime & agave", color: "#d9e86a", profile: { Agrumato: 8, Dolce: 3 }, note: "Freschezza e acidità viva" },
  { id: "vermouth", name: "Vermouth rosso", color: "#7a1f1a", profile: { Dolce: 4, Amaro: 4, Erbaceo: 3 }, note: "Vino aromatizzato, spezie" },
]

export const garnishes: Garnish[] = [
  { id: "orange", kind: "orange", name: "Scorza d'arancia", color: "#f08a24", profile: { Agrumato: 3 }, note: "Oli essenziali sprizzati" },
  { id: "leaf", kind: "leaf", name: "Foglia tropicale", color: "#3fae4f", profile: { Erbaceo: 3, Floreale: 1 }, note: "Note verdi e balsamiche" },
  { id: "cherry", kind: "cherry", name: "Ciliegia amarena", color: "#7d0a1c", profile: { Dolce: 3 }, note: "Frutto scuro e morbido" },
  { id: "pepper", kind: "pepper", name: "Pepe rosa", color: "#e2577a", profile: { Floreale: 2, Affumicato: 1 }, note: "Speziato e resinoso" },
]

export function blendProfile(...parts: Ingredient[]): Profile {
  const out = Object.fromEntries(FLAVORS.map((f) => [f, 0])) as Profile
  for (const p of parts) for (const f of FLAVORS) out[f] += p.profile[f] ?? 0
  for (const f of FLAVORS) out[f] = Math.min(10, out[f])
  return out
}

/** Mescola due colori hex (t = peso del secondo). */
export function mixColor(a: string, b: string, t = 0.55) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (n: number, s: number) => (n >> s) & 255
  const m = (s: number) => Math.round(ch(pa, s) * (1 - t) + ch(pb, s) * t)
  return `#${((m(16) << 16) | (m(8) << 8) | m(0)).toString(16).padStart(6, "0")}`
}
