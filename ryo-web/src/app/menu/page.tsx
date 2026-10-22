import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageHero } from "@/components/home/home-blocks"
import { MenuPage } from "@/components/menu/menu-page"
import { DrinkList } from "@/components/sections/drink-list"
import { Pairings } from "@/components/sections/pairings"

export const metadata: Metadata = {
  title: "Menu",
  description: "Churrascaria, tapas da condividere e cocktail d'autore: il menu di RYO a Cava de' Tirreni.",
  alternates: { canonical: "/menu" },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenuto">
        <PageHero title="Il menu" subtitle="Churrascaria, tapas da condividere e cocktail d'autore." image="/images/cucina/paella.jpg" alt="Paella da condividere" position="center 35%" />
        <MenuPage />
        <DrinkList />
        <Pairings />
      </main>
      <Footer />
    </>
  )
}
