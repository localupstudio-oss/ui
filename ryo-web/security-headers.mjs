/**
 * Header di sicurezza del sito, condivisi tra il server Next (next.config.ts) e la versione statica
 * per Netlify (scripts/netlify-headers.mjs scrive out/_headers).
 *
 * Content Security Policy statica (compatibile con il prerender statico/CDN):
 * - script: solo stesso dominio + integrità SRI sugli asset JS; 'unsafe-inline' resta necessario
 *   per i payload inline di React Server Components finché non si passa ai nonce (richiede rendering dinamico).
 * - frame: solo Google Maps (caricata su richiesta dell'utente).
 */
export function securityHeaders({ dev = false } = {}) {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "media-src 'self'",
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
  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "X-DNS-Prefetch-Control", value: "on" },
  ]
}
