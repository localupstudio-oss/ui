import { cn } from "@/lib/utils"
import { DemoBadge } from "@/components/demo-badge"

type Props = {
  /** Mantenuto per compatibilità: non viene più mostrato sopra il titolo. */
  eyebrow?: string
  title: React.ReactNode
  intro?: React.ReactNode
  align?: "left" | "center"
  demo?: boolean
  className?: string
}

export function SectionHeading({ title, intro, align = "center", demo, className }: Props) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <h2 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] text-balance">{title}</h2>
      {intro && <p className={cn("mt-6 max-w-[60ch] text-lg leading-relaxed text-pretty text-foreground/75", align === "center" && "mx-auto")}>{intro}</p>}
      {demo && <p className={cn("mt-5 flex", align === "center" && "justify-center")}><DemoBadge /></p>}
    </div>
  )
}
