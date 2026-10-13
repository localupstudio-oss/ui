/** Nastro arancio inclinato della prima versione del sito. */
export function Marquee({ items }: { items: string[] }) {
  const text = items.join(" ✦ ") + " ✦"
  return (
    <div aria-hidden className="overflow-x-clip py-16 sm:py-20">
    <div className="relative z-0 -mx-3 -rotate-[1.2deg] overflow-hidden bg-orange py-3.5 text-white">
      <div className="animate-marquee flex w-max gap-10 font-display text-2xl whitespace-nowrap">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
    </div>
  )
}
