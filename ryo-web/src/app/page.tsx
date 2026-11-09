import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HomeHero } from "@/components/home/home-hero"
import { FeatureCard, HomeIntro, PhotoStrip } from "@/components/home/home-blocks"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="contenuto">
        <HomeHero />
        <HomeIntro />
        <PhotoStrip />
        <div className="h-5 sm:h-8" />
        <div className="grid gap-5 px-3 pb-5 sm:gap-8 sm:px-10 sm:pb-8">
          <FeatureCard href="/menu" title="Il menu" image="/images/home/menu-brindisi-hd.jpg" alt="Un brindisi sopra la tavola tra tacos, tartare, paella e cocktail" position="center 40%" />
          <div className="grid gap-5 sm:gap-8 md:grid-cols-2">
            <FeatureCard
              size="half"
              href="/serate"
              title="Gli eventi della settimana"
              meta="Giovedì | Venerdì"
              cta="Scopri le serate"
              image="/images/serate/eventi-settimana-dj.jpg"
              alt="La console del DJ con una rosa rossa e la sala in festa"
              position="10% center"
            />
            <FeatureCard
              size="half"
              href="/eventi"
              title="Feste ed eventi privati"
              meta="Compleanni | Feste | Cene di gruppo"
              cta="Organizza la tua festa"
              image="/images/eventi/festa-torta-hd.jpg"
              alt="Una festa di compleanno da RYO con torta e fontane di luce"
              position="55% 72%"
            />
          </div>
        </div>
        <div className="h-24 sm:h-32" />
      </main>
      <Footer />
    </>
  )
}
