import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageHero } from "@/components/home/home-blocks"
import { Contacts } from "@/components/sections/contacts"

export const metadata: Metadata = {
  title: "Location & contatti",
  description: "Dove si trova RYO a Cava de' Tirreni: mappa, contatti e orari.",
  alternates: { canonical: "/contatti" },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenuto">
        <PageHero title="Location & contatti" image="/images/locale/sala-giungla.jpg" alt="La sala di RYO" />
        <Contacts />
      </main>
      <Footer />
    </>
  )
}
