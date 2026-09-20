'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

export type RevealProps = BoxProps & {
  /** Transition delay in ms (stagger siblings 60–120ms). */
  delayMs?: number
}

/**
 * Scroll-reveal that is safe without JavaScript: content is server-rendered
 * visible; only after hydration (and only when below the fold and motion is
 * allowed) is it hidden and revealed on intersection. Reduced motion and
 * no-JS visitors always see static, fully legible content.
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
    el.style.transform = 'translateY(26px)'
    el.style.transition = [
      `opacity 0.65s cubic-bezier(0.2, 0, 0, 1) ${delayMs}ms`,
      `transform 0.65s cubic-bezier(0.2, 0, 0, 1) ${delayMs}ms`,
    ].join(', ')

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
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
