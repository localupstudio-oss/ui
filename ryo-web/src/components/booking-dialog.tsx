"use client"

import { useEffect, useState } from "react"

import { BookingPanel } from "@/components/sections/booking"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

/**
 * Finestra di prenotazione unica per tutto il sito. Si apre da qualsiasi link a
 * "#prenota" (navbar, hero, churrasco, footer…) senza far scorrere la pagina, e
 * quando si arriva su una pagina con #prenota nell'indirizzo.
 */
export function BookingDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const a = (e.target as Element | null)?.closest?.("a[href]")
      const href = a?.getAttribute("href")
      if (!href || !/^(\/[^#]*)?#prenota$/.test(href)) return
      // link verso un'altra pagina con #prenota: si lascia navigare, la finestra si apre all'arrivo
      const path = href.split("#")[0]
      if (path && path !== location.pathname) return
      // fase di cattura: arriva prima di <Link>, che altrimenti farebbe scorrere la pagina
      e.preventDefault()
      e.stopPropagation()
      setOpen(true)
    }
    const fromHash = () => {
      if (location.hash === "#prenota") {
        setOpen(true)
        history.replaceState(null, "", location.pathname + location.search)
      }
    }
    document.addEventListener("click", onClick, true)
    window.addEventListener("hashchange", fromHash)
    const t = setTimeout(fromHash, 0)
    return () => {
      clearTimeout(t)
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("hashchange", fromHash)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        aria-describedby="prenota-desc"
        className="cream-surface block max-h-[92dvh] w-full max-w-[calc(100%-1.5rem)] overflow-y-auto overscroll-contain rounded-sm border-ink/15 px-5 pt-12 pb-10 text-ink sm:max-w-3xl sm:px-10 [&>[data-slot=dialog-close]]:text-ink [&>[data-slot=dialog-close]]:opacity-80"
      >
        <DialogTitle className="sr-only">Prenota un tavolo</DialogTitle>
        <DialogDescription id="prenota-desc" className="sr-only">
          Prenota su WhatsApp con il messaggio già pronto o compila il modulo.
        </DialogDescription>
        <BookingPanel />
      </DialogContent>
    </Dialog>
  )
}
