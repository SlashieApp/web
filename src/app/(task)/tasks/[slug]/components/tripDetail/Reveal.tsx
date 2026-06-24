'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

/** Durations mirror SDL `sdlMotion.duration.base` (150ms) / `.slow` (300ms). */
const DURATION: Record<'base' | 'slow', number> = {
  base: 0.15,
  slow: 0.3,
}

/**
 * Entrance reveal for trip-detail blocks. Movement + fade by default; under
 * `prefers-reduced-motion` it becomes an opacity fade with no transform, per SDL.
 * Animates transform/opacity only.
 */
export function Reveal({
  children,
  speed = 'base',
  delay = 0,
}: {
  children: ReactNode
  speed?: 'base' | 'slow'
  delay?: number
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: DURATION[speed],
        delay,
        ease: [0.2, 0, 0, 1],
      }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  )
}
