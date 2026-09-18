import { MOBILE_BOTTOM_NAV_CLEARANCE } from '@/ui/MobileBottomNav'

import { MARKETPLACE_MAP_MOTION_DURATION } from '../motion'

export type OverlaySurface = 'search' | 'taskDetail'

export type OverlayCompactRecipe = {
  topH: string
  bottomH: string
}

export type OverlayWideRecipe = {
  leftW: string
  leftPos: string
  bottomH: string
}

export const MAP_FADE_COMPACT_CLASS = 'map-fade-compact'
export const MAP_FADE_WIDE_CLASS = 'map-fade-wide'

/**
 * Stacking inside the Mapbox map: pins (1–4) → fade overlay → controls /
 * watermark. Fade must sit above task markers and below Mapbox chrome.
 */
export const MAP_FADE_Z_INDEX = 5
export const MAPBOX_CTRL_Z_INDEX = 10
/** Mapbox GL wrapper for zoom, logo, and attribution (not `ctrl-container`). */
export const MAPBOX_CTRL_CONTAINER_CLASS = 'mapboxgl-control-container'

export const MAP_FADE_MOTION_DURATION = MARKETPLACE_MAP_MOTION_DURATION

const white = (alpha: number) => `rgba(255, 255, 255, ${alpha})`

/** Header-band wash: short falloff, original compact recipe. */
export const MAP_FADE_TOP = `linear-gradient(to bottom, ${white(0.95)} 0%, ${white(0.55)} 42%, ${white(0)} 100%)`

/** Carousel / CTA-band wash: short falloff, original compact recipe. */
export const MAP_FADE_BOTTOM = `linear-gradient(to top, ${white(0.92)} 0%, ${white(0.5)} 48%, ${white(0)} 100%)`

export type MapFadeSide = 'left' | 'right' | 'top' | 'bottom'

const GRADIENT_TOWARD_CONTENT: Record<MapFadeSide, string> = {
  left: 'to right',
  right: 'to left',
  top: 'to bottom',
  bottom: 'to top',
}

export function mapFadeGradient(side: MapFadeSide): string {
  return `linear-gradient(${GRADIENT_TOWARD_CONTENT[side]}, ${white(0.95)} 0%, ${white(0.86)} 52%, ${white(0)} 100%)`
}

export const MAP_FADE_LEFT = mapFadeGradient('left')

/** Phone search: header-band and carousel-band heights. */
export const OVERLAY_MOBILE_SEARCH: OverlayCompactRecipe = {
  topH: '30%',
  bottomH: '40%',
}

/** Phone task-detail: slightly tighter header, slightly taller CTA band. */
export const OVERLAY_MOBILE_DETAIL: OverlayCompactRecipe = {
  topH: '28%',
  bottomH: '42%',
}

/**
 * Tablet uses the same compact (vertical) axis as phone. Sizes match until a
 * dedicated tablet chrome lands.
 */
export const OVERLAY_TABLET_SEARCH: OverlayCompactRecipe = {
  ...OVERLAY_MOBILE_SEARCH,
}
export const OVERLAY_TABLET_DETAIL: OverlayCompactRecipe = {
  ...OVERLAY_MOBILE_DETAIL,
}

/** Web search: full left half of the map, not only the 460px list. */
export const OVERLAY_WEB_SEARCH: OverlayWideRecipe = {
  leftW: '50%',
  leftPos: '0',
  bottomH: '0%',
}

/** Web task-detail: content column / camera split + lower cards. */
export const OVERLAY_WEB_DETAIL: OverlayWideRecipe = {
  leftW: '50%',
  leftPos: '0',
  bottomH: '50%',
}

/**
 * Lift Mapbox logo/attribution just above the task-card carousel and the glass
 * nav. Search stays in the mobile shell until `lg`. 7.5rem ≈ card + padding.
 */
export const OVERLAY_CTRL_BOTTOM_OFFSET_COMPACT = `calc(${MOBILE_BOTTOM_NAV_CLEARANCE} + 7.5rem)`

export const COMPACT_SEARCH_TOP_H = OVERLAY_MOBILE_SEARCH.topH
export const COMPACT_SEARCH_BOTTOM_H = OVERLAY_MOBILE_SEARCH.bottomH
export const COMPACT_DETAIL_TOP_H = OVERLAY_MOBILE_DETAIL.topH
export const COMPACT_DETAIL_BOTTOM_H = OVERLAY_MOBILE_DETAIL.bottomH
export const SEARCH_MAP_LEFT_FADE_SIZE = OVERLAY_WEB_SEARCH.leftW
export const SEARCH_MAP_LEFT_FADE_POS = OVERLAY_WEB_SEARCH.leftPos
export const DETAIL_MAP_LEFT_FADE_SIZE = OVERLAY_WEB_DETAIL.leftW
export const DETAIL_MAP_BOTTOM_FADE_SIZE = OVERLAY_WEB_DETAIL.bottomH
