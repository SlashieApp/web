import { sdlMotion } from '@/theme/styles'

/** Shared search ↔ detail camera / overlay duration. */
export const MARKETPLACE_MAP_MOTION_MS = 800

export const MARKETPLACE_MAP_MOTION_DURATION = `${MARKETPLACE_MAP_MOTION_MS}ms`

/**
 * Overlay wait after task-detail is on screen. Search-bound overlay uses `0ms`
 * so the wash starts immediately when leaving detail.
 */
export const MARKETPLACE_MAP_MOTION_DELAY = sdlMotion.duration.map

export const marketplaceMapMotion = {
  duration: MARKETPLACE_MAP_MOTION_DURATION,
  easing: sdlMotion.easing.standard,
  transitionProperty: 'width, height, left, bottom',
} as const
