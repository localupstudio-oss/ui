"use client"

import Image from "next/image"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { menus } from "@/content/site"
import { cn } from "@/lib/utils"

/**
 * Schermata dei menu: a sinistra i nomi in grande su fondo verde con trama, a destra la
 * copertina del menu su cui si trova il cliente (cambia al passaggio del mouse o al tocco).
 * Ogni nome apre il PDF del menu; i menu in arrivo restano visibili ma non cliccabili.
 */
export function MenuShowcase() {
  const [active, setActive] = useState(0)
  const current = menus[active]

  return (
    <section aria-label="I menu" className="relative grid min-h-[100svh] grid-cols-1 lg:grid-cols-2">
      {/* copertina: metà destra su schermi larghi, fascia in alto sul telefono */}
      <div className="relative h-[46svh] overflow-hidden lg:order-2 lg:h-auto">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.image}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={current.image} alt={current.alt} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent lg:hidden" />
      </div>

      <div className="pattern-croci relative flex flex-col items-center justify-center bg-background px-5 pt-12 pb-20 lg:order-1 lg:pt-36">
        <ul className="flex flex-col items-center gap-1 text-center sm:gap-2">
          {menus.map((m, i) => {
            const on = i === active
            const cls = cn(
              "font-display text-[clamp(2.6rem,6.4vw,5.4rem)] leading-[1.12] transition-colors duration-500",
              on ? "text-[#f6efe0]" : "text-foreground/30",
            )
            const focus = { onMouseEnter: () => setActive(i), onFocus: () => setActive(i), onTouchStart: () => setActive(i) }
            return (
              <li key={m.label} className="relative">
                {m.href ? (
                  <a href={m.href} target="_blank" rel="noopener" className={cls} {...focus}>
                    {m.label}
                  </a>
                ) : (
                  <span tabIndex={0} className={cn(cls, "relative cursor-default")} {...focus}>
                    {m.label}
                    <span className="absolute top-1/2 left-full ml-3 -translate-y-1/2 font-sans text-[0.6rem] tracking-[0.25em] whitespace-nowrap uppercase opacity-70 sm:text-xs">presto</span>
                  </span>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-10 max-w-sm text-center text-sm text-foreground/70" aria-live="polite">
          {current.sub}
        </p>
      </div>
    </section>
  )
}
