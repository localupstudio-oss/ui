/**
 * Rate limiter a finestra scorrevole in memoria.
 * Sufficiente per un singolo server Node; in ambiente serverless/multi-istanza
 * sostituirlo con uno store condiviso (es. Redis/Upstash) mantenendo la stessa firma.
 */
const hits = new Map<string, number[]>()

export function rateLimit(key: string, { limit = 5, windowMs = 10 * 60_000 } = {}) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return { ok: false, retryAfterMs: windowMs - (now - recent[0]) }
  }
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5_000) hits.delete(hits.keys().next().value as string)
  return { ok: true, retryAfterMs: 0 }
}
