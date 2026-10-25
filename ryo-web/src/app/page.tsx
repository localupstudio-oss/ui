import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HomeHero } from "@/components/home/home-hero"
import { FeatureCard, HomeIntro, PhotoStrip } from "@/components/home/home-blocks"
import { ChurrascoFeature } from "@/components/menu/churrasco"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="contenuto">
        <HomeHero />
        <HomeIntro />
        <PhotoStrip />
        <ChurrascoFeature />
        <div className="h-5 sm:h-8" />
        <div className="grid gap-5 px-3 pb-5 sm:gap-8 sm:px-10 sm:pb-8">
          <FeatureCard href="/menu" title="Il menu" image="/images/cucina/tavola-menu.jpg" alt="Una tavola apparecchiata con burger, tapas e cocktail al sole" position="center 58%" />
          <div className="grid gap-5 sm:gap-8 md:grid-cols-2">
            <FeatureCard
              size="half"
              href="/serate"
              title="Gli eventi della settimana"
              meta="Giovedì | Venerdì | Sabato"
              cta="Scopri le serate"
              image="/images/giovedi/microfono-tavola.jpg"
              alt="Il microfono della serata del giovedì sul menu tropicale"
            />
            <FeatureCard
              size="half"
              href="/eventi"
              title="Feste ed eventi privati"
              meta="Compleanni | Feste | Cene di gruppo"
              cta="Organizza la tua festa"
              image="/images/eventi/festa-torta.jpg"
              alt="Una festa di compleanno da RYO con torta e fontane di luce"
              position="center 40%"
            />
          </div>
        </div>
        <div className="h-24 sm:h-32" />
      </main>
      <Footer />
    </>
  )
}
