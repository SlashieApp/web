'use client'

import { Box } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import { useDeviceTier } from '../hooks/useDeviceTier'

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false })

/**
 * Client shell for the WebGL layer: measures the device tier, lazy-loads the
 * three.js chunk only when a tier is available (never for `off`), pauses the
 * render loop while the hero is off screen, and cross-fades over the poster.
 */
export function HeroCanvasLayer() {
  const tier = useDeviceTier()
  const [onScreen, setOnScreen] = useState(true)
  const [ready, setReady] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = wrapperRef.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry?.isIntersecting ?? true),
      { rootMargin: '80px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  if (tier === null || tier === 'off') {
    // Reduced motion / no WebGL / SSR: the static poster underneath is the hero.
    return <Box ref={wrapperRef} position="absolute" inset={0} aria-hidden />
  }

  return (
    <Box
      ref={wrapperRef}
      position="absolute"
      inset={0}
      aria-hidden
      opacity={ready ? 1 : 0}
      transition="opacity 1s ease"
    >
      <HeroCanvas
        tier={tier}
        active={onScreen}
        onReady={() => setReady(true)}
      />
    </Box>
  )
}
