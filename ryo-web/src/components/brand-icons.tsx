import type { SVGProps } from "react"

/** Icone social in stile lucide (lucide-react v1 non include più i marchi). */
const base = (props: SVGProps<SVGSVGElement>) => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
})

export const InstagramIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
)

export const FacebookIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1z" />
  </svg>
)

export const TikTokIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M15.5 3c.4 2.6 2 4.2 4.5 4.5v3.2a8 8 0 0 1-4.5-1.4V15a6 6 0 1 1-6-6v3.3A2.7 2.7 0 1 0 12.2 15V3z" />
  </svg>
)
