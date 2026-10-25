import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageHero } from "@/components/home/home-blocks"
import { BookingPanel } from "@/components/sections/booking"

export const metadata: Metadata = {
  title: "Prenota",
  description: "Prenota un tavolo da RYO a Cava de' Tirreni.",
  alternates: { canonical: "/prenota" },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenuto">
        <PageHero title="Prenota" image="/images/locale/bancone.jpg" alt="Il bancone di RYO" position="center 40%" />
        <section className="cream-surface px-5 py-24 sm:px-8 sm:py-28">
          <BookingPanel />
        </section>
      </main>
      <Footer />
    </>
  )
}
