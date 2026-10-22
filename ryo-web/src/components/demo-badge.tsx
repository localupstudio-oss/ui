import { site } from "@/content/site"

/** Segnala i contenuti dimostrativi finché `site.demo` è attivo. */
export function DemoBadge({ label = "Demo" }: { label?: string }) {
  if (!site.demo) return null
  return (
    <span
      title="Contenuto dimostrativo da sostituire con i dati reali"
      className="inline-block rounded-sm border border-dashed border-orange bg-orange/10 px-1.5 py-px text-[0.62rem] font-medium tracking-[0.08em] text-orange uppercase"
    >
      {label}
    </span>
  )
}
