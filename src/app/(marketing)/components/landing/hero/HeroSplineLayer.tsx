'use client'

import { Box } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import { useDeviceTier } from '../hooks/useDeviceTier'
import { HERO_SPLINE_SCENE_URL } from './splineScene'

const SplineScene = dynamic(
  () => import('./SplineScene').then((m) => m.SplineScene),
  { ssr: false },
)

/**
 * Client shell for the right-pane Spline human. Skips the runtime when the
 * device tier is off/low, the viewport is small, or the hero is off-screen.
 * The static poster underneath remains the LCP-friendly fallback.
 */
export function HeroSplineLayer() {
  const tier = useDeviceTier()
  const [onScreen, setOnScreen] = useState(true)
  const [ready, setReady] = useState(false)
  const [desktopOk, setDesktopOk] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = wrapperRef.current
    if (!element) return

    const mq = window.matchMedia('(min-width: 768px)')
    const syncDesktop = () => setDesktopOk(mq.matches)
    syncDesktop()
    mq.addEventListener('change', syncDesktop)

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry?.isIntersecting ?? true),
      { rootMargin: '120px 0px' },
    )
    observer.observe(element)

    return () => {
      mq.removeEventListener('change', syncDesktop)
      observer.disconnect()
    }
  }, [])

  const allowSpline =
    desktopOk && tier != null && tier !== 'off' && tier !== 'low'

  return (
    <Box
      ref={wrapperRef}
      position="absolute"
      inset={0}
      aria-hidden
      pointerEvents={allowSpline && ready && onScreen ? 'auto' : 'none'}
      opacity={allowSpline && ready ? 1 : 0}
      transition="opacity 0.6s cubic-bezier(0.2, 0, 0, 1)"
      css={{
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      }}
    >
      {allowSpline && onScreen ? (
        <SplineScene
          scene={HERO_SPLINE_SCENE_URL}
          onLoad={() => setReady(true)}
        />
      ) : null}
    </Box>
  )
}
