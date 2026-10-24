import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageHero } from "@/components/home/home-blocks"
import { Nights } from "@/components/sections/nights"
import { Thursday } from "@/components/sections/thursday"

export const metadata: Metadata = {
  title: "Le serate",
  description: "Quelli che il Giovedì e i DJ set del weekend: le serate di RYO a Cava de' Tirreni.",
  alternates: { canonical: "/serate" },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenuto" className="pattern-eliche">
        <PageHero title="Le serate" subtitle="Il giovedì si canta a tavola, il weekend si balla." image="/images/giovedi/microfono-sala.jpg" alt="Serata da RYO" />
        <Nights />
        <Thursday />
      </main>
      <Footer />
    </>
  )
}
