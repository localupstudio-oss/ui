# RYO — Luxury Cocktail Bar & Bistro

Sito ufficiale di RYO (Corso Umberto I, 1 — Cava de' Tirreni).
Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Framer Motion · React Three Fiber · Zod.

## Avvio

```bash
npm install
cp .env.example .env.local   # configura URL e webhook prenotazioni
npm run dev                  # http://localhost:3000
npm run build && npm start   # produzione
npm run lint
npm run build:preview        # bozza statica per il cliente in out/ (vedi sotto)
```

### Bozza statica per il cliente

`npm run build:preview` genera in `out/` un sito 100% statico da caricare su qualsiasi
hosting (Netlify Drop, GitHub Pages, ecc.). In questa modalità:

- niente server: il modulo prenotazioni valida i dati nel browser e invia il riepilogo
  su WhatsApp (`src/app/actions/booking.preview.ts`, sostituito via alias);
- immagini non ottimizzate, niente header HTTP, sitemap/robots/manifest esclusi;
- `noindex` attivo: la bozza non finisce su Google.

## Struttura

```
src/
  app/
    layout.tsx            # font, metadata SEO/OpenGraph, JSON-LD BarOrPub
    page.tsx              # composizione della home
    actions/booking.ts    # Server Action prenotazioni (Zod + honeypot + rate limit + webhook)
    privacy/ cookie/      # pagine legali
    sitemap.ts robots.ts manifest.ts icon.png apple-icon.png
  components/
    layout/               # Navbar glass, Footer, layout pagine legali
    sections/             # Hero, QuickAccess, Philosophy, DrinkList, Nights,
                          # Pairings, Booking, Location, SocialProof
    drinks/               # scena 3D della drink list (solo client, solo quando visibile)
    menu/                 # drawer menu con tab, allergeni e ingredienti
    ui/                   # componenti shadcn/ui
  content/                # ⬅ TUTTI i testi e dati del sito
  lib/validation/         # schemi Zod condivisi client/server
public/images/            # asset (vedi public/images/README.md)
```

## Aggiornare i contenuti

Tutti i contenuti stanno in `src/content/`:

| File | Contenuto |
|------|-----------|
| `site.ts` | indirizzo, contatti, social, orari, dati societari, flag `demo` |
| `menu.ts` | menu food, drink, drink special, allergeni (Reg. UE 1169/2011) |
| `experience.ts` | serate, abbinamenti, recensioni, statistiche, parcheggi |

Le voci marcate `✎` sono **segnaposto**. Finché `site.demo = true` le sezioni con
contenuti dimostrativi mostrano un badge "Demo". Prima del go-live:

- [ ] Menu, prezzi e allergeni ufficiali
- [ ] Orari esatti, line-up e dress code delle serate
- [ ] Recensioni reali (Google/TripAdvisor) e statistiche reali
- [ ] Parcheggi verificati sul posto
- [ ] Ragione sociale, P.IVA, REA, email; link TikTok e Facebook
- [ ] Foto staff (`public/images/staff/`) e foto originali ad alta risoluzione
- [ ] Revisione legale di Privacy e Cookie Policy
- [ ] `BOOKING_WEBHOOK_URL` configurato
- [ ] `site.demo = false`

## Sicurezza

- Header HTTP in `next.config.ts`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy, COOP; `poweredByHeader: false`.
- Subresource Integrity (SRI) sui bundle JS; nessun `eval` consentito in produzione
  (Zod in modalità `jitless`).
- Form: validazione Zod lato client **e** server con lo stesso schema, whitelist dei campi,
  honeypot anti-bot, rate limit per IP (in memoria: usare Redis/Upstash se multi-istanza).
- Google Maps caricata solo su consenso esplicito (click), niente cookie di terze parti al primo accesso.

## Prestazioni

- Pagine prerenderizzate statiche; `next/image` con AVIF/WebP, `sizes` responsive, lazy loading.
- three.js caricato con `next/dynamic` solo lato client e montato solo quando la sezione è visibile;
  `frameloop` fermo fuori viewport.
- Animazioni disattivate con `prefers-reduced-motion`.
