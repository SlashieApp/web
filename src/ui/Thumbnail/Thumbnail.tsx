'use client'

import { Box, type BoxProps, Center, chakra } from '@chakra-ui/react'
import Image from 'next/image'
import { useState } from 'react'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

/** Interactive shell — a real <button> so it is keyboard + screen-reader native. */
const InteractiveShell = chakra('button')

/**
 * SDL Thumbnail. Square list/carousel card image with a graceful placeholder,
 * loading shimmer and error fallback.
 *
 * - Surfaces/placeholders use SDL semantic roles only (`bg.subtle`, `text.subtle`).
 * - When `onClick` (or `href`) is supplied the thumbnail becomes interactive: it
 *   renders with a visible `sdlFocusRing`, a >=44px touch target and `sdlMotion`
 *   transitions (transform/opacity only, reduced-motion aware).
 * - The error state is signalled by an icon + label (never color alone) using the
 *   `status.danger` family.
 */
export type ThumbnailSize = 'sm' | 'md' | 'lg'

/** Min-width per size; all thumbnails stay square via `aspect-ratio: 1 / 1`. */
const sizeMinWidth: Record<ThumbnailSize, string> = {
  sm: '88px',
  md: '120px',
  lg: '160px',
}

export type ThumbnailProps = Omit<BoxProps, 'onError' | 'children'> & {
  /** Accessible description of the image (required). */
  alt: string
  /** Image URL. When absent the placeholder is shown. */
  src?: string
  /** Visual size; controls the min-width of the square. Defaults to `md` (120px). */
  size?: ThumbnailSize
  /** Object-fit of the image. Defaults to `cover`. */
  fit?: 'cover' | 'contain'
  /** Pass-through to Next/Image `priority` for above-the-fold thumbnails. */
  priority?: boolean
  /**
   * Makes the thumbnail interactive. Renders as a button with focus ring and a
   * >=44px touch target. Supply `aria-label` if `alt` is not descriptive enough.
   */
  onClick?: () => void
}

/** Placeholder / fallback glyph (decorative). Uses `currentColor`. */
function ImageGlyph() {
  return (
    <Box asChild aria-hidden width="40%" maxW="48px" color="text.subtle">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="presentation"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </Box>
  )
}

/**
 * Loading shimmer. Animates `opacity` only (transform-safe) and is disabled for
 * users who prefer reduced motion, falling back to a calm static surface.
 */
const shimmerStyles = {
  position: 'absolute',
  inset: 0,
  bg: 'bg.subtle',
  animation: 'sdl-thumbnail-pulse 1.4s ease-in-out infinite',
  '@keyframes sdl-thumbnail-pulse': {
    '0%, 100%': { opacity: 0.45 },
    '50%': { opacity: 0.8 },
  },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    opacity: 0.7,
  },
} as const

/**
 * Interactive treatment: visible focus ring, gentle hover/press motion (transform
 * + box-shadow only) and a >=44px touch target. Reduced-motion users get no scale.
 */
const interactiveStyles = {
  cursor: 'pointer',
  minW: '44px',
  minH: '44px',
  transitionProperty: 'transform, opacity, box-shadow',
  transitionDuration: sdlMotion.duration.moderate,
  transitionTimingFunction: sdlMotion.easing.standard,
  _hover: { transform: 'scale(1.02)', boxShadow: 'e2' },
  _active: { transform: 'scale(0.99)' },
  _focusVisible: sdlFocusRing,
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    _hover: { transform: 'none' },
    _active: { transform: 'none' },
  },
} as const

export function Thumbnail({
  alt,
  src,
  size = 'md',
  fit = 'cover',
  priority,
  onClick,
  borderRadius = 'xl',
  ...boxProps
}: ThumbnailProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  const showImage = Boolean(src) && !errored
  const interactive = typeof onClick === 'function'

  const inner = (
    <>
      {/* Empty / error placeholder sits underneath the image. */}
      <Center position="absolute" inset={0} flexDirection="column" gap={1}>
        {errored ? <ErrorState /> : !src ? <ImageGlyph /> : null}
      </Center>

      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          priority={priority}
          sizes={sizeMinWidth[size]}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={{
            objectFit: fit,
            opacity: loaded ? 1 : 0,
            transition: `opacity ${sdlMotion.duration.moderate} ${sdlMotion.easing.standard}`,
          }}
        />
      ) : null}

      {/* Loading shimmer while the image decodes. */}
      {showImage && !loaded ? (
        <Box as="span" aria-hidden css={shimmerStyles} />
      ) : null}
    </>
  )

  const shared = {
    position: 'relative' as const,
    minW: sizeMinWidth[size],
    aspectRatio: '1 / 1',
    borderRadius,
    overflow: 'hidden',
    bg: 'bg.subtle',
    color: 'text.subtle',
    display: 'block',
  }

  if (interactive) {
    return (
      <InteractiveShell
        type="button"
        onClick={onClick}
        aria-label={alt}
        css={interactiveStyles}
        {...shared}
        {...(boxProps as Record<string, unknown>)}
      >
        {inner}
      </InteractiveShell>
    )
  }

  return (
    <Box {...shared} {...boxProps}>
      {inner}
    </Box>
  )
}

/** Error fallback: icon + label so the failure is not signalled by color alone. */
function ErrorState() {
  return (
    <>
      <Box asChild aria-hidden width="32%" maxW="40px" color="status.danger.fg">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="presentation"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 16l5-5 4 4" />
          <path d="M14 13l3-3 4 4" />
          <path d="M21 21 3 3" />
        </svg>
      </Box>
      <Box
        as="span"
        fontSize="xs"
        fontWeight={600}
        color="status.danger.fg"
        px={1}
        textAlign="center"
      >
        Image unavailable
      </Box>
    </>
  )
}
