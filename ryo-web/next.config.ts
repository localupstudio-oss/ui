import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV === "development"
/** `npm run build:preview` → bozza statica in `out/` (nessun server: niente Server Actions, header e ottimizzazione immagini). */
const isPreview = process.env.STATIC_PREVIEW === "1"

/**
 * Content Security Policy statica (compatibile con il prerender statico/CDN).
 * - script: solo stesso dominio + integrità SRI sugli asset JS; 'unsafe-inline' resta necessario
 *   per i payload inline di React Server Components finché non si passa ai nonce (richiede rendering dinamico).
 * - frame: solo Google Maps (caricata su richiesta dell'utente).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
]

const nextConfig: NextConfig = {
  // PPR/Cache Components non sono compatibili con l'export statico della bozza.
  cacheComponents: !isPreview,
  partialPrefetching: !isPreview,
  poweredByHeader: false,
  reactStrictMode: true,
  // Bozza statica: solo pagine .tsx (esclude sitemap/robots/manifest .ts, inutili e non esportabili con Cache Components).
  ...(isPreview && { output: "export" as const, trailingSlash: true, pageExtensions: ["tsx"] }),
  turbopack: {
    ...(isPreview && { resolveAlias: { "@/app/actions/booking": "./src/app/actions/booking.preview.ts" } }),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    unoptimized: isPreview,
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2560],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    sri: { algorithm: "sha256" },
    optimizePackageImports: ["lucide-react", "@react-three/drei", "framer-motion"],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/images/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ]
  },
}

if (isPreview) delete nextConfig.headers // nessun server nella bozza: gli header si configurano sull'hosting

export default nextConfig
