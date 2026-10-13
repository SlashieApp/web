'use client'

import { Box, type BoxProps, type SystemStyleObject } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { sdlMotion } from '@/theme/styles'

/** Distance the section starts below its resting position. */
export const SURFACE_ENTER_OFFSET = '1.25rem'

/**
 * First-paint entrance for a task-detail surface (cards, tabs, skeletons).
 * `@starting-style` runs on insert, so skeleton and loaded content both rise
 * from the bottom without a mount effect.
 */
export const surfaceEnterFromBottomCss = {
  opacity: 1,
  transform: 'translateY(0)',
  transformOrigin: 'bottom center',
  transitionProperty: 'opacity, transform',
  transitionDuration: sdlMotion.duration.slow,
  transitionTimingFunction: sdlMotion.easing.standard,
  '@starting-style': {
    opacity: 0,
    transform: `translateY(${SURFACE_ENTER_OFFSET})`,
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    transform: 'none',
    '@starting-style': {
      opacity: 1,
      transform: 'none',
    },
  },
} as SystemStyleObject

const STAGGER_STEP_MS = 40
const STAGGER_MAX = 6

/**
 * FE-258: each child card fades in and rises 4px, 40ms apart. Put on the
 * stack that holds the cards; reduced motion turns it off.
 */
export const staggerChildrenCss = {
  '& > *': {
    transitionProperty: 'opacity, transform',
    transitionDuration: sdlMotion.duration.base,
    transitionTimingFunction: sdlMotion.easing.standard,
    '@starting-style': { opacity: 0, transform: 'translateY(4px)' },
  },
  ...Object.fromEntries(
    Array.from({ length: STAGGER_MAX - 1 }, (_, i) => [
      `& > *:nth-child(${i + 2})`,
      { transitionDelay: `${(i + 1) * STAGGER_STEP_MS}ms` },
    ]),
  ),
  '@media (prefers-reduced-motion: reduce)': {
    '& > *': {
      transition: 'none',
      '@starting-style': { opacity: 1, transform: 'none' },
    },
  },
} as SystemStyleObject

/**
 * Whole-section fade-up on surface render. Use around a complete block
 * (including skeleton) so the section enters once from the bottom.
 */
export function Reveal({
  children,
  ...boxProps
}: { children: ReactNode } & BoxProps) {
  return (
    <Box w="full" css={surfaceEnterFromBottomCss} {...boxProps}>
      {children}
    </Box>
  )
}
