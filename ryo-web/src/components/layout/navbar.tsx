"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion"

import { nav, site } from "@/content/site"
import { cn } from "@/lib/utils"

const TOP_KEY = "ryo-nav-top"

/** Header trasparente con logo a sinistra e menu a schermo intero (fondo crema con trama, scritte verdi) a destra. */
export function Navbar() {
  const [open, setOpen] = useState(false)
  // Sblocca subito lo scroll: se si naviga con la pagina ancora bloccata, il router
  // non riesce a riportarla in cima e la nuova pagina si apre a metà.
  const close = () => {
    document.body.style.overflow = ""
    setOpen(false)
  }
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const pathname = usePathname()

  // Arrivati da un link del menu a tendina: si parte dall'inizio della pagina, subito.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(TOP_KEY)) {
        sessionStorage.removeItem(TOP_KEY)
        window.scrollTo({ top: 0, behavior: "instant" })
      }
    } catch {}
  }, [pathname])

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40))

  // Blocca lo scroll della pagina e chiudi con Esc quando il menu è aperto.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled && !open ? "bg-background/85 backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1800px] items-center justify-between px-5 sm:h-24 sm:px-10">
          <Link href="/" aria-label={`${site.fullName} — home`} onClick={close} className="relative block h-9 w-[116px] sm:h-11 sm:w-[142px]">
            <Image
              src={open ? "/images/brand/wordmark-dark.png" : "/images/brand/wordmark-light.png"}
              alt={site.name}
              fill
              priority
              sizes="142px"
              className="object-contain object-left"
            />
          </Link>

          <button
            type="button"
            onClick={() => (open ? close() : setOpen(true))}
            aria-expanded={open}
            aria-controls="menu-principale"
            aria-label={open ? "Chiudi il menu" : "Apri il menu"}
            className={cn("group relative grid size-11 place-items-center", open ? "text-green" : "text-foreground")}
          >
            <span
              className={cn(
                "absolute h-px w-7 bg-current transition-transform duration-500",
                open ? "rotate-45" : "-translate-y-[5px] group-hover:-translate-y-[7px]",
              )}
            />
            <span
              className={cn(
                "absolute h-px w-7 bg-current transition-transform duration-500",
                open ? "-rotate-45" : "translate-y-[5px] group-hover:translate-y-[7px]",
              )}
            />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu-principale"
            aria-label="Menu principale"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="pattern-fronde fixed inset-0 z-40 flex flex-col overflow-y-auto text-green"
          >
            <ul className="flex flex-1 flex-col items-center justify-center gap-2 px-5 pt-24 pb-6 text-center sm:gap-3">
              {nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={item.href}
                    scroll={false}
                    onClick={() => {
                      // la nuova pagina deve aprirsi dall'inizio (vedi effetto sotto)
                      try {
                        sessionStorage.setItem(TOP_KEY, "1")
                      } catch {}
                      close()
                    }}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="font-display text-[clamp(2.2rem,6vw,4rem)] transition-opacity hover:opacity-60"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-6 px-5 pb-8 sm:flex-row sm:justify-between sm:px-10"
            >
              <p className="order-2 text-xs text-green/80 sm:order-1">
                {site.address.street} · {site.address.city}
              </p>
              <Link
                href="#prenota"
                onClick={close}
                className="order-1 rounded-full bg-green px-8 py-3.5 text-[0.95rem] text-cream transition-colors hover:bg-ink sm:order-2"
              >
                Prenota un tavolo
              </Link>
              <p className="order-3 text-xs text-green/80">{site.phone}</p>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
