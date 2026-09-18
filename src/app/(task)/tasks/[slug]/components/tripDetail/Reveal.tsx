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
export const surfaceEnterFromBottomCss: SystemStyleObject = {
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
}

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
