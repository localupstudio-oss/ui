import type { MetadataRoute } from "next"

import { site } from "@/content/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.fullName,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#070d0a",
    theme_color: "#070d0a",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  }
}
