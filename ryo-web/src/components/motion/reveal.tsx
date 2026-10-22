"use client"

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion"

type RevealProps = HTMLMotionProps<"div"> & { delay?: number; y?: number }

/** Comparsa allo scroll: fade + slide, disattivata con prefers-reduced-motion. */
export function Reveal({ delay = 0, y = 32, children, ...props }: RevealProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
