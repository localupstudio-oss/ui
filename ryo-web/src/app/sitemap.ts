import type { MetadataRoute } from "next"

import { nights } from "@/content/experience"
import { site } from "@/content/site"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    ...["menu", "serate", "eventi", "prenota", "contatti"].map((p) => ({ url: `${site.url}/${p}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...nights.map((n) => ({ url: `${site.url}/serate/${n.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    { url: `${site.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/cookie`, changeFrequency: "yearly", priority: 0.2 },
  ]
}
