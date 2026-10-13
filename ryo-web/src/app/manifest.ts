import type { MetadataRoute } from "next"

import { site } from "@/content/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.fullName,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a1410",
    theme_color: "#0a1410",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  }
}
