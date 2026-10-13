import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { QuickAccess } from "@/components/sections/quick-access"
import { Philosophy } from "@/components/sections/philosophy"
import { MixologyLab } from "@/components/sections/mixology-lab"
import { Nights } from "@/components/sections/nights"
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
        <Philosophy />
        <MixologyLab />
        <Nights />
        <Pairings />
        <Booking />
        <Location />
        <SocialProof />
      </main>
      <Footer />
    </>
  )
}
