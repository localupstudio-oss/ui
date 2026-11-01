import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { NightDetail } from "@/components/sections/night-detail"
import { nights } from "@/content/experience"

export function generateStaticParams() {
  return nights.map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const n = nights.find((x) => x.slug === slug)
  if (!n) return {}
  return { title: n.title, description: n.mood, alternates: { canonical: `/serate/${n.slug}` } }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const n = nights.find((x) => x.slug === slug)
  if (!n) notFound()
  return (
    <>
      <Navbar />
      <main id="contenuto">
        <NightDetail night={n} />
      </main>
      <Footer />
    </>
  )
}
