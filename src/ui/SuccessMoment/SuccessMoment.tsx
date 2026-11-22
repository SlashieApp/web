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
 * A success moment (Ryan 22 Nov; wiki Foundations-Elevation-Motion): the
 * block that shows the outcome settles in and a tick draws beside its status,
 * once. Task posted, quote sent, quote accepted, review sent, Slashie Pro
 * active. The block is the confirmation, so there is no pop-up as well.
 *
 * Put `momentSettleCss` on the block's heading group and `<SuccessTick />`
 * beside its status, for the first view only.
 */

/**
 * The block settling in: a short rise with the emphasis curve's gentle
 * overshoot, the one playful motion in the product. Reduced motion fades it
 * in.
 */
export const momentSettleCss = {
  animationName: 'moment-settle',
  animationDuration: sdlMotion.duration.slow,
  animationTimingFunction: sdlMotion.easing.emphasis,
  animationFillMode: 'both',
  '@media (prefers-reduced-motion: reduce)': {
    animationName: 'step-in-fade',
    animationDuration: sdlMotion.duration.base,
    animationTimingFunction: sdlMotion.easing.standard,
  },
} as const

/**
 * The tick: a green ring, then the tick inside it, drawn once as the block
 * lands (the secondary action that follows through). Decorative: the block's
 * words say it. Reduced motion shows it drawn.
 */
export function SuccessTick() {
  return (
    <Svg
      data-success-tick=""
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
