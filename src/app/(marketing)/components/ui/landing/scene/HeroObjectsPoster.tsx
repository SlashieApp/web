'use client'

import { Box } from '@chakra-ui/react'

import { BREAKPOINT_PX } from '@/theme/breakpoints'
import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'

import { useSceneReady } from '../story/storyState'

/** Screens at least this wide get the 16:9 still; the wide one (16:10) is for the laptops below it. */
export const POSTER_LARGE_MIN_PX = 1700

/**
 * The stills, widest first: the first `media` that matches wins and the `img`
 * is the phone's. Each is rendered from the live scene at its own size (the
 * `Poster*` stories of `LandingScene`), so the objects sit where the live scene
 * puts them at that size, and `cover` crops only a little between sizes.
 */
export const POSTER_SOURCES = [
  {
    media: `(min-width: ${POSTER_LARGE_MIN_PX}px)`,
    src: '/images/landing/hero-objects-large.webp',
  },
  {
    media: `(min-width: ${BREAKPOINT_PX.lg}px)`,
    src: '/images/landing/hero-objects-wide.webp',
  },
  {
    media: `(min-width: ${BREAKPOINT_PX.md}px)`,
    src: '/images/landing/hero-objects-middle.webp',
  },
] as const

export const POSTER_PHONE_SRC = '/images/landing/hero-objects-compact.webp'

/**
 * A still render of the hero's 3D objects (from the `Poster*` stories of
 * `LandingScene`). It is what reduced-motion, no-WebGL and no-JS visitors
 * see, and it holds the composition until the live scene has drawn, then
 * fades out. Scrolls away with the hero, unlike the fixed live scene.
 *
 * The `img` is a plain element with inline styles: a styled component would
 * put its `<style>` tag between the `<source>`s and the `img`, and the browser
 * then fetches the wide still as well as the one that applies.
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
        {POSTER_SOURCES.map(({ media, src }) => (
          <source key={src} media={media} srcSet={src} />
        ))}
        <img
          src={POSTER_PHONE_SRC}
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="low"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </picture>
    </Box>
  )
}
