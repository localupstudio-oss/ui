import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageHero } from "@/components/home/home-blocks"
import { ChurrascoFeature } from "@/components/menu/churrasco"
import { MenuCarta, MenuPdfButtons } from "@/components/menu/menu-page"

export const metadata: Metadata = {
  title: "Menu",
  description: "Churrasco Menù, tapas, platos, carnes e la drink list di RYO a Cava de' Tirreni.",
  alternates: { canonical: "/menu" },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenuto">
        <PageHero title="Il menu" subtitle="Churrascaria, tapas da condividere e cocktail d'autore." image="/images/cucina/paella.jpg" alt="Paella da condividere" position="center 35%" />
        <MenuPdfButtons />
        <ChurrascoFeature id="churrasco" />
        <MenuCarta />
      </main>
      <Footer />
    </>
  )
}
