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
    <LegalPage title="Cookie Policy" updated="ottobre 2026">
      <p>Questo sito utilizza esclusivamente cookie tecnici necessari al funzionamento e non installa cookie di profilazione.</p>
      <h2>Contenuti di terze parti</h2>
      <ul>
        <li>
          <strong>Google Maps</strong>: la mappa viene caricata solo dopo un tuo clic su &ldquo;Mostra la mappa&rdquo;; da quel momento Google può installare i propri cookie
          (vedi l&apos;informativa di Google).
        </li>
        <li><strong>WhatsApp</strong>: i link aprono l&apos;app o il sito di WhatsApp, soggetti all&apos;informativa di Meta.</li>
      </ul>
      <h2>Gestione dei cookie</h2>
      <p>Puoi eliminare o bloccare i cookie dalle impostazioni del browser. Bloccare i cookie tecnici può compromettere alcune funzionalità.</p>
      <p>Per domande scrivi a <a className="text-amber" href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </LegalPage>
  )
}
