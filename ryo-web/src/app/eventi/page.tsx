import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageHero } from "@/components/home/home-blocks"
import { EventEnquiry } from "@/components/sections/event-enquiry"

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
          title="Feste ed eventi privati"
          subtitle="Compleanni, feste e cene di gruppo da RYO: scrivici su WhatsApp e organizziamo insieme la tua serata."
          image="/images/giovedi/tavolata.jpg"
          alt="Una tavolata di amici da RYO"
        />
        <EventEnquiry />
      </main>
      <Footer />
    </>
  )
}
