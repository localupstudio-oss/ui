import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { site } from "@/content/site"

/** Layout tipografico per le pagine legali. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <main id="contenuto" className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-amber hover:underline">
          <ArrowLeft className="size-4" /> Torna a {site.name}
        </Link>
        <h1 className="mt-8 font-display text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ultimo aggiornamento: {updated}</p>
        {site.demo && (
          <p className="mt-6 rounded-2xl border border-dashed border-orange/50 bg-orange/10 p-4 text-sm text-orange">
            Bozza da far verificare a un consulente legale e completare con i dati del titolare prima della pubblicazione.
          </p>
        )}
        <div className="mt-10 space-y-6 leading-relaxed text-foreground/85 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}
