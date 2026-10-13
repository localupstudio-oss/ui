"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { CalendarCheck, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { nav, site } from "@/content/site"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>("")

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24))

  // Evidenzia la voce della sezione visibile.
  useEffect(() => {
    const ids = nav.map((n) => n.href.slice(1))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
    >
      <nav
        aria-label="Navigazione principale"
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-full px-3 pr-2 transition-all duration-500 sm:px-4",
          scrolled ? "glass shadow-[0_20px_60px_-25px_rgb(0_0_0/0.8)]" : "border border-transparent bg-transparent",
        )}
      >
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.fullName} — home`}>
          <Image src="/images/brand/logo.png" alt="" width={44} height={44} priority className="size-10 sm:size-11" />
          <span className="font-display text-xl">{site.name}</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm text-foreground/75 transition-colors hover:text-foreground",
                  active === item.href && "text-foreground",
                )}
              >
                {active === item.href && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button asChild size="lg" className="rounded-full px-5 font-semibold shadow-[0_0_30px_-8px_var(--amber)]">
            <a href="#prenota">
              <CalendarCheck className="size-4" />
              <span className="hidden sm:inline">Prenota un Tavolo</span>
              <span className="sm:hidden">Prenota</span>
            </a>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="Apri menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm border-border bg-background/95 backdrop-blur-xl">
              <SheetHeader>
                <SheetTitle className="font-display text-3xl">{site.name}</SheetTitle>
                <SheetDescription>{site.claim}</SheetDescription>
              </SheetHeader>
              <ul className="mt-4 flex flex-col px-4">
                {nav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-border py-4 font-display text-xl transition-colors hover:text-orange"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  )
}
