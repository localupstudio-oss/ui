import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { MenuCarta } from "@/components/menu/menu-page"
import { MenuShowcase } from "@/components/menu/menu-showcase"

export const metadata: Metadata = {
  title: "Menu",
  description: "Churrasco Menù, tapas, platos, carnes e la drink list di RYO a Cava de' Tirreni.",
  alternates: { canonical: "/menu" },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenuto" className="pattern-croci">
        <MenuShowcase />
        <div className="pt-24">
          <MenuCarta />
        </div>
      </main>
      <Footer />
    </>
  )
}
