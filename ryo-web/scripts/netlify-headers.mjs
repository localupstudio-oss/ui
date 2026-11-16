// Dopo `next build` statico: scrive out/_headers, così anche su Netlify il sito ha gli stessi header di sicurezza
// del server (Netlify li legge da questo file). Le immagini e i PDF restano in cache un giorno.
import { writeFileSync } from "node:fs"

import { securityHeaders } from "../security-headers.mjs"

const lines = ["/*", ...securityHeaders().map((h) => `  ${h.key}: ${h.value}`), "", "/images/*", "  Cache-Control: public, max-age=86400, stale-while-revalidate=604800", "", "/menu/*", "  Cache-Control: public, max-age=86400", ""]
writeFileSync(new URL("../out/_headers", import.meta.url), lines.join("\n"))
console.log("out/_headers scritto")
