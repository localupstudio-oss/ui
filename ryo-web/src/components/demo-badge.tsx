import { site } from "@/content/site"

/** Segnala i contenuti dimostrativi finché `site.demo` è attivo. */
export function DemoBadge({ label = "Demo" }: { label?: string }) {
  if (!site.demo) return null
  return (
    <span
      title="Contenuto dimostrativo da sostituire con i dati reali"
      className="inline-block rounded border border-dashed border-orange/60 bg-orange/15 px-1.5 py-px font-mono text-[0.62rem] tracking-[0.06em] text-[#ffb38c] uppercase"
    >
      {label}
    </span>
  )
}
