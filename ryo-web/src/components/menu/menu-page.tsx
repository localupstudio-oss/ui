"use client"

import { AlertTriangle } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DemoBadge } from "@/components/demo-badge"
import { ItemList } from "@/components/menu/menu-sheet"
import { drinkMenu, drinkSpecials, foodMenu } from "@/content/menu"

const sections = [
  { id: "food", label: "Cucina", categories: foodMenu },
  { id: "drink", label: "Cocktail", categories: drinkMenu },
  { id: "special", label: "Drink special", categories: [{ id: "special", label: "Edizioni limitate", items: drinkSpecials }] },
]

/** Menu completo nella pagina /menu: schede Cucina / Cocktail / Special, ogni piatto con ingredienti e allergeni. */
export function MenuPage() {
  return (
    <section id="carta" className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
      <p className="mb-10 flex justify-center"><DemoBadge label="Menu dimostrativo: piatti e prezzi da sostituire" /></p>
      <Tabs defaultValue="food">
        <TabsList className="mx-auto mb-12 flex h-auto w-fit gap-2 bg-transparent p-0">
          {sections.map((s) => (
            <TabsTrigger
              key={s.id}
              value={s.id}
              className="rounded-full border border-border px-6 py-2.5 text-base data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:border-foreground dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background"
            >
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((s) => (
          <TabsContent key={s.id} value={s.id} className="grid gap-16">
            {s.categories.map((c) => (
              <div key={c.id}>
                <h2 className="mb-6 text-center font-display text-4xl">{c.label}</h2>
                <ItemList items={c.items} />
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>
      <p className="mt-16 flex gap-2 text-xs leading-relaxed text-muted-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber" />
        Allergeni secondo il Reg. UE 1169/2011. Per intolleranze o allergie chiedi al personale.
      </p>
    </section>
  )
}
