"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

// Al primo caricamento la pagina entra subito (c'è già il video della home); la tenda solo quando si cambia pagina.
let firstLoad = true

const EASE = [0.76, 0, 0.24, 1] as const

/**
 * Passaggio tra le pagine: una tenda verde con il logo copre per un attimo lo schermo e si alza
 * sulla nuova pagina. Si anima solo la tenda (fixed): il contenuto non riceve transform, così
 * header fisso e foto sticky restano al loro posto.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  const [curtain] = useState(() => !firstLoad)
  useEffect(() => {
    firstLoad = false
  }, [])

  return (
    <>
      {children}
      {curtain && !reduce && (
        <motion.div
          aria-hidden
          className="pattern-croci pointer-events-none fixed inset-0 z-[70] grid place-items-center bg-background"
          initial={{ y: "0%" }}
          animate={{ y: "-100%" }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
        >
          <motion.div
            className="relative h-12 w-[156px]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -6] }}
            transition={{ duration: 0.6, times: [0, 0.35, 0.65, 1] }}
          >
            <Image src="/images/brand/wordmark-light.png" alt="" fill sizes="156px" className="object-contain" />
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
