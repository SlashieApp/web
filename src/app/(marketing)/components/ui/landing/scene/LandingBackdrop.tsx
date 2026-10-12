'use client'

import { Box } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { WEB_MIN_PX } from '@/theme/breakpoints'

import { TIER_SETTINGS, useDeviceTier } from '../hooks/useDeviceTier'
import { setSceneReady } from '../story/storyState'

// three.js only loads on devices that will actually draw the scene.
const LandingScene = dynamic(() => import('./LandingScene'), { ssr: false })

/**
 * Fixed layer behind the whole landing: the mint wash, and on capable
 * devices the floating 3D objects. Reduced motion, no WebGL and no JS keep
 * just the wash (the hero carries a still poster of the objects).
 */
export function LandingBackdrop() {
  const tier = useDeviceTier()
  const [compact, setCompact] = useState(false)

  // Client navigation away and back mounts a fresh canvas.
  useEffect(() => () => setSceneReady(false), [])

  useEffect(() => {
    // Same split as the story layout: below `lg` the phone is inline and the
    // scene shows three objects.
    const query = window.matchMedia(`(max-width: ${WEB_MIN_PX - 1}px)`)
    const sync = () => setCompact(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const live = tier !== null && tier !== 'off'

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={0}
      pointerEvents="none"
      bgGradient="to-b"
      gradientFrom="status.success.soft"
      gradientVia="bg.canvas"
      gradientTo="bg.canvas"
      aria-hidden
    >
      {live ? (
        <LandingScene
          compact={compact || tier === 'low'}
          dprMax={TIER_SETTINGS[tier].dprMax}
          onReady={() => setSceneReady(true)}
        />
      ) : null}
    </Box>
  )
}
