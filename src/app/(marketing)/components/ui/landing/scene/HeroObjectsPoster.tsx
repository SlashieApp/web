'use client'

import { Box } from '@chakra-ui/react'

import { BREAKPOINT_PX } from '@/theme/breakpoints'
import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'

import { useSceneReady } from '../story/storyState'

/** Screens at least this wide (and wide in shape) get the 16:9 still; the wide one (16:10) is for the laptops below it. */
export const POSTER_LARGE_MIN_PX = 1700

/**
 * The shape of the window each still is drawn for, as aspect ratios (width over
 * height). A still is a picture of the props where the live scene puts them at
 * one size, and `cover` crops it to the window, so it holds only where the
 * window is about that shape: on a short or a landscape window the crop puts a
 * prop under the heading, the search or the header's buttons. Outside these
 * shapes there is no still (`POSTER_NONE_MEDIA`): the props are decoration, and
 * the live scene, where there is one, puts them right at any size.
 *   - compact: phones, 390 x 844 (0.46); up to 5:8 (a 375 x 667 is 0.56);
 *   - middle: tablets, 768 x 1024 (0.75); 5:8 up to 5:4;
 *   - wide: laptops, 1440 x 900 (1.6); 5:4 up to 2:1 (1366 x 768 is 1.78);
 *   - large: 16:9, 1920 x 1080 (1.78); 8:5 up to 2:1.
 */
export const POSTER_ASPECT = {
  /** Phones are taller than this; wider is the middle still. */
  compactMax: '5/8',
  /** Below this a window is squarer than a laptop; from it, the wide still. */
  wideMin: '5/4',
  /** Wider than this (a short, wide window) has no still. */
  max: '2/1',
  largeMin: '8/5',
} as const

/**
 * The stills, widest first: the first `media` that matches wins and the `img`
 * is the phone's. Each is rendered from the live scene at its own size (the
 * `Poster*` stories of `LandingScene`), so the objects sit where the live scene
 * puts them at that size, and `cover` crops only a little between sizes. The
 * conditions are the width the still has pixels for and the shape it is drawn
 * for (`POSTER_ASPECT`).
 */
export const POSTER_SOURCES = [
  {
    media: `(min-width: ${POSTER_LARGE_MIN_PX}px) and (min-aspect-ratio: ${POSTER_ASPECT.largeMin})`,
    src: '/images/landing/hero-objects-large.webp',
  },
  {
    media: `(min-width: ${BREAKPOINT_PX.lg}px) and (min-aspect-ratio: ${POSTER_ASPECT.wideMin})`,
    src: '/images/landing/hero-objects-wide.webp',
  },
  {
    media: `(min-width: ${BREAKPOINT_PX.md}px) and (min-aspect-ratio: ${POSTER_ASPECT.compactMax})`,
    src: '/images/landing/hero-objects-middle.webp',
  },
] as const

export const POSTER_PHONE_SRC = '/images/landing/hero-objects-compact.webp'

/**
 * The windows no still is drawn for, which hide the poster (a CSS media query
 * list, so it holds with no JavaScript too):
 *   - a window under 500px tall (a phone on its side, a short browser): the
 *     props would sit under the text;
 *   - a window 2:1 or wider;
 *   - a window under `md` that is not tall, such as a phone on its side (the
 *     compact still is a portrait);
 *   - a window under `lg` that is wider than it is tall by a laptop's share, such
 *     as a tablet on its side (the wide still needs `lg`).
 */
export const POSTER_NONE_MEDIA = [
  '(max-height: 499px)',
  `(min-aspect-ratio: ${POSTER_ASPECT.max})`,
  `(max-width: ${BREAKPOINT_PX.md - 1}px) and (min-aspect-ratio: ${POSTER_ASPECT.compactMax})`,
  `(max-width: ${BREAKPOINT_PX.lg - 1}px) and (min-aspect-ratio: ${POSTER_ASPECT.wideMin})`,
].join(', ')

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
      // No still fits a short or a landscape window (`POSTER_NONE_MEDIA`).
      css={{ [`@media ${POSTER_NONE_MEDIA}`]: { display: 'none' } }}
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
