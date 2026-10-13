import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p className="text-xs tracking-[0.4em] text-brass uppercase">Errore 404</p>
        <h1 className="mt-4 font-display text-6xl">Ti sei perso nella giungla.</h1>
        <Button asChild className="mt-8 rounded-full"><Link href="/">Torna al bancone</Link></Button>
      </div>
    </main>
  )
}
