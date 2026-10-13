"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Martini, Sparkles, UtensilsCrossed, type LucideIcon } from "lucide-react"

import { MenuSheet } from "@/components/menu/menu-sheet"
import { drinkMenu, drinkSpecials, foodMenu, type MenuCategory } from "@/content/menu"

type Panel = { id: "food" | "drink" | "special"; label: string; hint: string; icon: LucideIcon; title: string; description: string; categories: MenuCategory[] }

const panels: Panel[] = [
  {
    id: "food",
    label: "Menu Food",
    hint: "Crudi, paella, burger e piatti da condividere",
    icon: UtensilsCrossed,
    title: "Menu Food",
    description: "La cucina di RYO: piatti colorati, pensati per stare al centro del tavolo.",
    categories: foodMenu,
  },
  {
    id: "drink",
    label: "Menu Drink",
    hint: "Signature, grandi classici e zero proof",
    icon: Martini,
    title: "Menu Drink",
    description: "Distillati selezionati, sciroppi fatti in casa e ghiaccio cristallino.",
    categories: drinkMenu,
  },
  {
    id: "special",
    label: "Drink Special",
    hint: "Edizioni limitate del master bartender",
    icon: Sparkles,
    title: "Drink Special",
    description: "Creazioni a rotazione, disponibili solo per pochi giorni.",
    categories: [{ id: "special", label: "Special", items: drinkSpecials }],
  },
]

export function QuickAccess() {
  const [open, setOpen] = useState<Panel["id"] | null>(null)
  const current = panels.find((p) => p.id === open)

  return (
    <section id="menu" aria-label="Accesso rapido ai menu" className="relative z-10 -mt-20 px-5 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">
        {panels.map((p, i) => (
          <motion.button
            key={p.id}
            onClick={() => setOpen(p.id)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            aria-haspopup="dialog"
            className="group glass relative overflow-hidden rounded-3xl p-6 text-left shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] transition-colors hover:border-brass/50"
          >
            <span className="absolute inset-0 -z-10 bg-gradient-to-br from-brass/0 via-brass/0 to-brass/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="flex items-start justify-between">
              <span className="grid size-12 place-items-center rounded-2xl border border-brass/30 bg-brass/10 text-brass transition-colors group-hover:bg-brass group-hover:text-primary-foreground">
                <p.icon className="size-5" />
              </span>
              <ArrowUpRight className="size-5 text-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brass" />
            </div>
            <p className="mt-6 font-display text-3xl">{p.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{p.hint}</p>
          </motion.button>
        ))}
      </div>

      {current && (
        <MenuSheet
          open={open !== null}
          onOpenChange={(o) => !o && setOpen(null)}
          title={current.title}
          description={current.description}
          categories={current.categories}
        />
      )}
    </section>
  )
}
