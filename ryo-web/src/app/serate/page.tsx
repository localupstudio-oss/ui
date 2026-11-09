import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageHero } from "@/components/home/home-blocks"
import { Nights } from "@/components/sections/nights"

export const metadata: Metadata = {
  title: "Le serate",
  description: "Quelli che il Giovedì e T'immagini del venerdì: le serate di RYO a Cava de' Tirreni.",
  alternates: { canonical: "/serate" },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenuto" className="pattern-eliche">
        <PageHero title="Le notti di RYO" image="/images/giovedi/microfono-sala.jpg" alt="Serata da RYO" />
        <Nights />
      </main>
      <Footer />
    </>
  )
}
