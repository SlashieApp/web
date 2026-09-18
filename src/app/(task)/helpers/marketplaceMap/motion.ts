import { sdlMotion } from '@/theme/styles'

/** Shared search ↔ detail camera / overlay duration. */
export const MARKETPLACE_MAP_MOTION_MS = 800

export const MARKETPLACE_MAP_MOTION_DURATION = `${MARKETPLACE_MAP_MOTION_MS}ms`

export const marketplaceMapMotion = {
  duration: MARKETPLACE_MAP_MOTION_DURATION,
  easing: sdlMotion.easing.standard,
  transitionProperty: 'width, height, left',
} as const
