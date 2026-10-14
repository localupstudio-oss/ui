import type { Metadata, Viewport } from "next"
import { Bowlby_One, Inter, Space_Mono } from "next/font/google"

import { fullAddress, site } from "@/content/site"
import "./globals.css"

const bowlby = Bowlby_One({ variable: "--font-bowlby", subsets: ["latin"], weight: "400", display: "swap" })
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: ["400", "700"], display: "swap" })
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" })

const title = `${site.fullName} · Cava de' Tirreni`

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.fullName,
  keywords: [
    "cocktail bar Cava de' Tirreni",
    "bistrot Cava de' Tirreni",
    "mixology Salerno",
    "aperitivo Cava de' Tirreni",
    "DJ set Cava de' Tirreni",
    "RYO cocktail bar",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: "/",
    siteName: site.fullName,
    title,
    description: site.description,
    images: [{ url: "/images/og/og-default.jpg", width: 1200, height: 630, alt: "Il bancone di RYO tra felci e lampade in rattan" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: ["/images/og/og-default.jpg"],
  },
  // La bozza per il cliente non deve finire su Google.
  robots: process.env.STATIC_PREVIEW === "1" ? { index: false, follow: false } : { index: true, follow: true },
  formatDetection: { telephone: true, address: true },
}

export const viewport: Viewport = {
  themeColor: "#0a1410",
  colorScheme: "dark",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["BarOrPub", "Restaurant"],
  name: site.fullName,
  url: site.url,
  image: `${site.url}/images/og/og-default.jpg`,
  logo: `${site.url}/images/brand/logo.png`,
  telephone: site.phone,
  servesCuisine: ["Cocktail", "Mediterranea", "Fusion"],
  priceRange: "€€€",
  acceptsReservations: true,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    postalCode: site.address.zip,
    addressLocality: site.address.city,
    addressRegion: site.address.province,
    addressCountry: site.address.country,
  },
  hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "19:00",
      closes: "01:00",
    },
  ],
  sameAs: Object.values(site.social).filter(Boolean),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`dark ${bowlby.variable} ${spaceMono.variable} ${inter.variable}`}>
      <body className="min-h-dvh overflow-x-clip font-sans">
        <a
          href="#contenuto"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Vai al contenuto
        </a>
        {children}
        <script
          type="application/ld+json"
          // JSON statico generato dal content layer: nessun input utente.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  )
}
