import { cn } from "@/lib/utils"
import { DemoBadge } from "@/components/demo-badge"

type Props = {
  eyebrow: string
  title: React.ReactNode
  intro?: React.ReactNode
  align?: "left" | "center"
  demo?: boolean
  className?: string
}

export function SectionHeading({ eyebrow, title, intro, align = "left", demo, className }: Props) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("eyebrow flex items-center gap-3", align === "center" && "justify-center")}>
        {eyebrow}
        {demo && <DemoBadge />}
      </p>
      <h2 className="mt-4 font-display text-[clamp(2.3rem,6vw,4.2rem)] text-balance">{title}</h2>
      {intro && <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">{intro}</p>}
    </div>
  )
}
