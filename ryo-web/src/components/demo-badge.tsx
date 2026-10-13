import { Badge } from "@/components/ui/badge"
import { site } from "@/content/site"

/** Segnala i contenuti dimostrativi finché `site.demo` è attivo. */
export function DemoBadge({ label = "Demo" }: { label?: string }) {
  if (!site.demo) return null
  return (
    <Badge variant="outline" className="border-dashed border-ember/60 text-[0.6rem] tracking-widest text-ember normal-case" title="Contenuto dimostrativo da sostituire con i dati reali">
      {label}
    </Badge>
  )
}
