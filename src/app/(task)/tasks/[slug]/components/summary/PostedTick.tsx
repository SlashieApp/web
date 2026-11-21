'use client'

import { chakra } from '@chakra-ui/react'

import { sdlMotion } from '@/theme/styles'

const Svg = chakra('svg')

/** The block settles first (`moment-settle`, 300ms); the tick follows it. */
const TICK_DELAY = sdlMotion.duration.moderate

const drawCss = (delay: string) => ({
  strokeDasharray: 1,
  strokeDashoffset: 0,
  animationName: 'tick-draw',
  animationDuration: sdlMotion.duration.slow,
  animationTimingFunction: sdlMotion.easing.standard,
  animationDelay: delay,
  animationFillMode: 'both',
  '@media (prefers-reduced-motion: reduce)': { animationName: 'none' },
})

/**
 * The tick of the "Task posted" moment (Ryan 22 Nov): a green ring, then the
 * tick inside it, drawn once beside the status pill as the block lands (the
 * secondary action that follows through). Decorative: the headline says it.
 * Reduced motion shows it drawn.
 */
export function PostedTick() {
  return (
    <Svg
      data-posted-tick=""
      aria-hidden
      viewBox="0 0 24 24"
      boxSize="22px"
      flexShrink={0}
      fill="none"
      stroke="currentColor"
      color="status.success.fg"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <chakra.circle
        cx={12}
        cy={12}
        r={9}
        pathLength={1}
        css={drawCss(TICK_DELAY)}
      />
      <chakra.path
        d="M8 12.5l2.75 2.75L16 9.75"
        pathLength={1}
        css={drawCss(sdlMotion.duration.slow)}
      />
    </Svg>
  )
}
