'use client'

import { motion, useReducedMotion, useSpring } from 'motion/react'
import { type ReactNode, useCallback, useRef } from 'react'

const MAX_PULL_PX = 7

/**
 * Magnetic wrapper for CTAs: the child eases a few px toward a fine pointer
 * and springs back on leave. Pure enhancement — inert on touch devices, with
 * reduced motion, or without JS.
 */
export function Magnetic({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(0, { stiffness: 260, damping: 22 })
  const y = useSpring(0, { stiffness: 260, damping: 22 })

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || event.pointerType !== 'mouse') return
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const relX = (event.clientX - (rect.left + rect.width / 2)) / rect.width
      const relY = (event.clientY - (rect.top + rect.height / 2)) / rect.height
      x.set(relX * 2 * MAX_PULL_PX)
      y.set(relY * 2 * MAX_PULL_PX)
    },
    [reducedMotion, x, y],
  )

  const onPointerLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      style={{ x, y, display: 'inline-flex' }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </motion.div>
  )
}
