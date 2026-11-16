import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV === "development"
/** `npm run build:preview` → bozza statica in `out/` (nessun server: niente Server Actions, header e ottimizzazione immagini). */
const isPreview = process.env.STATIC_PREVIEW === "1"

import { securityHeaders as buildHeaders } from "./security-headers.mjs"

const securityHeaders = buildHeaders({ dev: isDev })

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
    qualities: [75, 85, 90, 92],
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
