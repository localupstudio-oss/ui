import type { Metadata } from "next"

import { LegalPage } from "@/components/layout/legal-page"
import { site } from "@/content/site"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Informativa sul trattamento dei dati personali di ${site.fullName}.`,
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="30 ottobre 2026">
      <p>
        Informativa ai sensi degli artt. 13–14 del Regolamento (UE) 2016/679 (GDPR) per gli utenti del sito di {site.fullName}.
      </p>
      <h2>Titolare del trattamento</h2>
      <p>
        {site.company.legalName}, sede legale in {site.company.legalSeat}, P.IVA {site.company.vat}, REA {site.company.rea}, in persona del legale
        rappresentante {site.company.legalRep}. Il locale {site.fullName} si trova in {site.address.street}, {site.address.zip} {site.address.city} ({site.address.province}).
        Contatti: <a className="text-amber" href={`mailto:${site.email}`}>{site.email}</a> · tel. {site.phone}.
      </p>
      <h2>Dati trattati e finalità</h2>
      <ul>
        <li>Dati inseriti nei moduli di prenotazione ed eventi (nome, email, telefono, data, numero ospiti, azienda, note) per gestire la richiesta — base giuridica: misure precontrattuali (art. 6.1.b). Inviando il modulo, il riepilogo viene aperto in WhatsApp e spedito da te al nostro numero: da quel momento si applica anche l&apos;informativa di WhatsApp (Meta).</li>
        <li>Dati tecnici di navigazione (indirizzo IP, log del server) per sicurezza e prevenzione abusi — base giuridica: legittimo interesse (art. 6.1.f).</li>
      </ul>
      <h2>Conservazione</h2>
      <p>I dati delle prenotazioni sono conservati per il tempo necessario a gestire la richiesta e comunque non oltre 12 mesi, salvo obblighi di legge.</p>
      <h2>Destinatari</h2>
      <p>Fornitori tecnici (hosting, strumenti di gestione prenotazioni) nominati responsabili del trattamento. I dati non sono diffusi né venduti.</p>
      <h2>Diritti dell&apos;interessato</h2>
      <p>Il conferimento dei dati è facoltativo, ma senza i dati richiesti non possiamo gestire la prenotazione.</p>
      <p>Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opporti al trattamento scrivendo al titolare, oltre a proporre reclamo al Garante per la protezione dei dati personali.</p>
    </LegalPage>
  )
}
