"use client"

import Image from "next/image"
import { AlertTriangle, Leaf } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DemoBadge } from "@/components/demo-badge"
import { ALLERGENS, formatPrice, type MenuCategory, type MenuItem } from "@/content/menu"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  categories: MenuCategory[]
}

export function MenuSheet({ open, onOpenChange, title, description, categories }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto border-border bg-background/95 p-0 backdrop-blur-2xl sm:max-w-2xl">
        <SheetHeader className="jungle-glow sticky top-0 z-10 border-b border-border bg-background/90 p-6 backdrop-blur-xl">
          <SheetTitle className="flex items-center gap-3 font-display text-3xl">
            {title} <DemoBadge label="Menu demo" />
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        {categories.length > 1 ? (
          <Tabs defaultValue={categories[0].id} className="p-6">
            <TabsList className="mb-6 h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
              {categories.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="rounded-md px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent">
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((c) => (
              <TabsContent key={c.id} value={c.id}>
                <ItemList items={c.items} />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="p-6">
            <ItemList items={categories[0]?.items ?? []} />
          </div>
        )}

        <p className="flex gap-2 border-t border-border p-6 text-xs leading-relaxed text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber" />
          Allergeni secondo il Reg. UE 1169/2011. Per intolleranze o allergie chiedi al personale: le preparazioni possono contenere tracce di altri allergeni.
        </p>
      </SheetContent>
    </Sheet>
  )
}

function ItemList({ items }: { items: MenuItem[] }) {
  return (
    <Accordion type="single" collapsible className="flex flex-col gap-3">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="overflow-hidden rounded-2xl border border-border bg-card/60 last:border-b">
          <AccordionTrigger className="items-center gap-4 p-3 pr-5 hover:no-underline">
            <div className="flex flex-1 items-center gap-4 text-left">
              {item.image && (
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg">{item.name}</span>
                  {item.tags?.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[0.65rem] tracking-wider uppercase">
                      {t === "veg" && <Leaf className="size-3" />}
                      {t}
                    </Badge>
                  ))}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
              <span className="font-mono text-base font-bold text-amber tabular-nums">{formatPrice(item.price)}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="rule-line mb-4 opacity-50" />
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="mb-2 eyebrow">Ingredienti</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {item.ingredients.map((i) => (
                    <span key={i} className="rounded-full border border-border px-2.5 py-0.5 text-foreground/85">{i}</span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="mb-2 eyebrow">Allergeni</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {item.allergens.length === 0 ? (
                    <span className="text-muted-foreground">Nessun allergene principale</span>
                  ) : (
                    item.allergens.map((a) => (
                      <span key={a} className="rounded-full bg-orange/15 px-2.5 py-0.5 text-orange">{ALLERGENS[a]}</span>
                    ))
                  )}
                </dd>
              </div>
            </dl>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
