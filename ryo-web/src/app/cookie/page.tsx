import type { Metadata } from "next"

import { LegalPage } from "@/components/layout/legal-page"
import { site } from "@/content/site"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Informativa sull'uso dei cookie del sito ${site.fullName}.`,
  alternates: { canonical: "/cookie" },
}

export default function CookiePage() {
  return (
    <LegalPage title="Cookie Policy" updated="30 ottobre 2026">
      <p>Questo sito utilizza esclusivamente cookie tecnici necessari al funzionamento e non installa cookie di profilazione.</p>
      <h2>Contenuti di terze parti</h2>
      <ul>
        <li>
          <strong>Google Maps</strong>: nel sito la mappa è un&apos;immagine e non installa cookie; il link &ldquo;Apri in Google Maps&rdquo; ti porta sul sito di Google,
          soggetto alla sua informativa.
        </li>
        <li><strong>WhatsApp</strong>: i link aprono l&apos;app o il sito di WhatsApp, soggetti all&apos;informativa di Meta.</li>
      </ul>
      <h2>Gestione dei cookie</h2>
      <p>Puoi eliminare o bloccare i cookie dalle impostazioni del browser. Bloccare i cookie tecnici può compromettere alcune funzionalità.</p>
      <p>Titolare: {site.company.legalName}, P.IVA {site.company.vat}. Per domande scrivi a <a className="text-amber" href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </LegalPage>
  )
}
