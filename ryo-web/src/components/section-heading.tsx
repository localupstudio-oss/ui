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
      <p className={cn("flex items-center gap-3 text-xs font-semibold tracking-[0.32em] text-brass uppercase", align === "center" && "justify-center")}>
        <span className="h-px w-8 bg-brass/60" />
        {eyebrow}
        {demo && <DemoBadge />}
      </p>
      <h2 className="mt-5 font-display text-4xl leading-[1.05] font-medium text-balance sm:text-5xl lg:text-6xl">{title}</h2>
      {intro && <p className="mt-6 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">{intro}</p>}
    </div>
  )
}
