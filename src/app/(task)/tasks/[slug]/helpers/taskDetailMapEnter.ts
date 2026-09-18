import { sdlMotion } from '@/theme/styles'

/** Opacity fade used when the task-detail Mapbox canvas first paints. */
export const taskDetailMapEnterProps = {
  transitionProperty: 'opacity',
  transitionDuration: sdlMotion.duration.map,
  transitionTimingFunction: sdlMotion.easing.decelerate,
} as const

export const taskDetailMapEnterCss = {
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
} as const
