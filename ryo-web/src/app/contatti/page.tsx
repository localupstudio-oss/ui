import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageHero } from "@/components/home/home-blocks"
import { Location } from "@/components/sections/location"

export const metadata: Metadata = {
  title: "Location & contatti",
  description: "Dove si trova RYO, come arrivare e dove parcheggiare a Cava de' Tirreni.",
  alternates: { canonical: "/contatti" },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenuto">
        <PageHero title="Location & contatti" image="/images/locale/sala-giungla.jpg" alt="La sala di RYO" />
        <Location />
      </main>
      <Footer />
    </>
  )
}
