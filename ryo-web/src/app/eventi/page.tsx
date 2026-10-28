import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
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
        <EventEnquiry />
      </main>
      <Footer />
    </>
  )
}
