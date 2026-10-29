'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

import { sdlMotion } from '@/theme/styles'

/** How far a reveal rises while it fades in. */
export const REVEAL_RISE_PX = 8
/** How long the fade and rise take. */
export const REVEAL_MS = 400

export type RevealProps = BoxProps & {
  /** Transition delay in ms (stagger siblings 60–120ms). */
  delayMs?: number
}

/**
 * Scroll-reveal that is safe without JavaScript: content is server-rendered
 * visible; only after hydration (and only when below the fold and motion is
 * allowed) is it hidden and revealed on intersection. The reveal is a fade
 * with an 8px rise, 400ms on the decelerate curve, and it plays once (FE-471).
 * Reduced motion and no-JS visitors always see static, fully legible content.
 */
export function Reveal({ children, delayMs = 0, ...boxProps }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Already on screen (or nearly) at hydration: skip to avoid a hide flash.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.92) return

    el.style.opacity = '0'
    el.style.transform = `translateY(${REVEAL_RISE_PX}px)`
    el.style.transition = [
      `opacity ${REVEAL_MS}ms ${sdlMotion.easing.decelerate} ${delayMs}ms`,
      `transform ${REVEAL_MS}ms ${sdlMotion.easing.decelerate} ${delayMs}ms`,
    ].join(', ')

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.style.opacity = '1'
          // `none`, not `translateY(0)`: a settled reveal must not stay a
          // containing block for fixed or sticky children.
          el.style.transform = 'none'
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [delayMs])

  return (
    <Box ref={ref} {...boxProps}>
      {children}
    </Box>
  )
}
