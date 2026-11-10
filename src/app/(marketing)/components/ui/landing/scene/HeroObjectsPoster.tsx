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
 *   - compact: tall windows from `sm`, drawn at 390 x 844 (0.46); up to 5:8
 *     (a phone, below `sm`, has the toolbox's own slot in the hero instead);
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

/** The toolbox alone, fitted into its slot: the one prop a phone's hero has (`HeroToolboxSlot`). */
export const TOOLBOX_STILL_SRC = '/images/landing/hero-toolbox.webp'

/**
 * The stills, widest first: the first `media` that matches wins and the `img`
 * is the compact one. Each is rendered from the live scene at its own size (the
 * `Poster*` stories of `LandingScene`), so the objects sit where the live scene
 * puts them at that size, and `cover` crops only a little between sizes. The
 * conditions are the width the still has pixels for and the shape it is drawn
 * for (`POSTER_ASPECT`).
 *
 * The last one is not a still of this layer: below `sm` the layer is hidden
 * (`POSTER_NONE_MEDIA`) and a hidden `img` is still fetched, so there it
 * points at the file the hero's slot shows. A phone then fetches one still,
 * the one it draws, and not the compact one as well.
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
  {
    media: `(max-width: ${BREAKPOINT_PX.sm - 1}px)`,
    src: TOOLBOX_STILL_SRC,
  },
] as const

export const POSTER_PHONE_SRC = '/images/landing/hero-objects-compact.webp'

/**
 * The windows no still is drawn for, which hide the poster (a CSS media query
 * list, so it holds with no JavaScript too):
 *   - a phone (below `sm`): its hero is as tall as its copy, so a picture of
 *     the whole screen cannot put a prop beside the right row; the hero keeps
 *     a slot for the toolbox instead (`HeroToolboxSlot`);
 *   - a window under 500px tall (a phone on its side, a short browser): the
 *     props would sit under the text;
 *   - a window 2:1 or wider;
 *   - a window under `md` that is not tall, such as a phone on its side (the
 *     compact still is a portrait);
 *   - a window under `lg` that is wider than it is tall by a laptop's share, such
 *     as a tablet on its side (the wide still needs `lg`).
 */
export const POSTER_NONE_MEDIA = [
  `(max-width: ${BREAKPOINT_PX.sm - 1}px)`,
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

/**
 * A phone's one prop (below `sm`): the box the hero keeps for the toolbox, at
 * its foot. It is one page gutter (16px) in from the screen's edge and from
 * the panel under the hero, and never reaches the "See how it works" link
 * beside it: 72px square, less where the screen is too narrow for that. The
 * link is centred and 136px wide with its padding in English (less in
 * Chinese); the slot allows for one of 160px, so half the screen less 100px
 * is what is free to its left, a gutter and 4px of air taken off.
 *
 * It shows the toolbox's still, which is what reduced-motion, no-WebGL and
 * no-JS visitors see; the live scene reads the box off the page and draws its
 * own toolbox there (`fitToSlot`), and the still fades out once it has. The
 * still is a background: from `sm` the box is not displayed, so no other
 * screen fetches it.
 */
export function HeroToolboxSlot() {
  const sceneReady = useSceneReady()
  return (
    <Box
      data-hero-toolbox-slot=""
      aria-hidden
      hideFrom="sm"
      position="absolute"
      left={4}
      bottom={4}
      boxSize="min(72px, calc(50vw - 100px))"
      // Under the copy, like the poster.
      zIndex={-1}
      pointerEvents="none"
      bgImage={`url(${TOOLBOX_STILL_SRC})`}
      bgSize="contain"
      bgRepeat="no-repeat"
      bgPos="center"
      opacity={sceneReady ? 0 : 1}
      transition="opacity 600ms ease"
    />
  )
}
