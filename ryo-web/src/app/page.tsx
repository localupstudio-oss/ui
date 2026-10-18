import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { QuickAccess } from "@/components/sections/quick-access"
import { Philosophy } from "@/components/sections/philosophy"
import { DrinkList } from "@/components/sections/drink-list"
import { Marquee } from "@/components/marquee"
import { Nights } from "@/components/sections/nights"
import { Thursday } from "@/components/sections/thursday"
import { Pairings } from "@/components/sections/pairings"
import { Booking } from "@/components/sections/booking"
import { Location } from "@/components/sections/location"
import { SocialProof } from "@/components/sections/social-proof"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="contenuto">
        <Hero />
        <QuickAccess />
        <Marquee items={["Cocktail", "Bar", "Cucina", "This is RYO Weekend", "Cava de' Tirreni"]} />
        <Philosophy />
        <DrinkList />
        <Nights />
        <Thursday />
        <Pairings />
        <Booking />
        <Location />
        <SocialProof />
      </main>
      <Footer />
    </>
  )
}
