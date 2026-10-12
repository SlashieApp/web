'use client'

import { Box, chakra } from '@chakra-ui/react'

import { WEB_MIN_PX } from '@/theme/breakpoints'
import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'

import { useSceneReady } from '../story/storyState'

const Img = chakra('img')

/**
 * A still render of the hero's 3D objects (from the `Poster*` stories of
 * `LandingScene`). It is what reduced-motion, no-WebGL and no-JS visitors
 * see, and it holds the composition until the live scene has drawn, then
 * fades out. Scrolls away with the hero, unlike the fixed live scene.
 */
export function HeroObjectsPoster() {
  const sceneReady = useSceneReady()
  return (
    <Box
      position="absolute"
      // Start under the sticky header, like the full-viewport live scene.
      top={{
        base: `-${HEADER_MIN_HEIGHT.base}`,
        md: `-${HEADER_MIN_HEIGHT.md}`,
      }}
      left={0}
      right={0}
      h="100vh"
      zIndex={-1}
      pointerEvents="none"
      opacity={sceneReady ? 0 : 1}
      transition="opacity 600ms ease"
      aria-hidden
    >
      <picture>
        <source
          media={`(max-width: ${WEB_MIN_PX - 1}px)`}
          srcSet="/images/landing/hero-objects-compact.webp"
        />
        <Img
          src="/images/landing/hero-objects-wide.webp"
          alt=""
          w="full"
          h="full"
          objectFit="cover"
          loading="eager"
          decoding="async"
          fetchPriority="low"
        />
      </picture>
    </Box>
  )
}
