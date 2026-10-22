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
              href="/serate#giovedi"
              title="Quelli che il Giovedì"
              meta="Giovedì | Start 21:30 | Cena, karaoke e festa"
              image="/images/giovedi/microfono-tavola.jpg"
              alt="Il microfono della serata sul menu tropicale"
            />
            <FeatureCard
              size="half"
              href="/serate#serate"
              title="RYO Weekend"
              meta="Venerdì T'immagini | Sabato Churrasco Experience"
              image="/images/eventi/bancone-scimmia.jpg"
              alt="Il bancone di RYO di sera"
            />
          </div>
          <div className="grid gap-5 sm:gap-8 md:grid-cols-2">
            <FeatureCard
              size="half"
              href={MENU_PDF.drink}
              external
              title="Drink List"
              meta="Signature | Tiempo Negroni"
              image="/images/drink/highball-rosa.jpg"
              alt="Highball rosa tra foglie tropicali"
            />
            <FeatureCard
              size="half"
              href="/eventi"
              title="Eventi privati"
              meta="Compleanni | Aziende | Feste"
              image="/images/giovedi/bottle-service.jpg"
              alt="Bottle service sotto il soffitto di felci"
              position="40% center"
            />
          </div>
        </div>
        <div className="h-24 sm:h-32" />
      </main>
      <Footer />
    </>
  )
}
