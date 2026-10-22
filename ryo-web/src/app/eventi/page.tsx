import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageHero } from "@/components/home/home-blocks"
import { Booking } from "@/components/sections/booking"

export const metadata: Metadata = {
  title: "Eventi privati",
  description: "Compleanni, feste private ed eventi aziendali da RYO a Cava de' Tirreni.",
  alternates: { canonical: "/eventi" },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenuto">
        <PageHero
          title="Eventi privati"
          subtitle="Compleanni, cene aziendali e feste: un'area dedicata o l'intero locale, con menu e drink su misura."
          image="/images/giovedi/tavolata.jpg"
          alt="Una tavolata di amici da RYO"
        />
        <Booking defaultTab="evento" />
      </main>
      <Footer />
    </>
  )
}
