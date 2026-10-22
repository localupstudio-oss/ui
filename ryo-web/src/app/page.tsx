import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HomeHero } from "@/components/home/home-hero"
import { FeatureCard, HomeIntro, PhotoStrip } from "@/components/home/home-blocks"
import { ChurrascoFeature, MENU_PDF } from "@/components/menu/churrasco"

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
          <FeatureCard href="/menu" title="Il menu" image="/images/galleria/tavola-condivisa.jpg" alt="Tavola con paella, crudi e cocktail" position="center 60%" />
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
              cta="Richiedi un preventivo"
              image="/images/giovedi/tavolata.jpg"
              alt="Una tavolata di amici da RYO"
            />
          </div>
          <div className="grid gap-5 sm:gap-8 md:grid-cols-2">
            <FeatureCard
              size="half"
              href={MENU_PDF.drink}
              external
              title="Drink List"
              meta="Signature | Tiempo Negroni"
              cta="Apri la drink list"
              image="/images/drink/highball-rosa.jpg"
              alt="Highball rosa tra foglie tropicali"
            />
            <FeatureCard
              size="half"
              href="/contatti"
              title="Location"
              meta="Corso Umberto I, 1 | Cava de' Tirreni"
              cta="Come arrivare"
              image="/images/locale/sala-giungla.jpg"
              alt="La sala di RYO"
            />
          </div>
        </div>
        <div className="h-24 sm:h-32" />
      </main>
      <Footer />
    </>
  )
}
