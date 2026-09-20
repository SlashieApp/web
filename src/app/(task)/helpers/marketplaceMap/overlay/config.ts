import { MOBILE_BOTTOM_NAV_CLEARANCE } from '@/ui/MobileBottomNav'

import {
  MARKETPLACE_MAP_MOTION_DELAY,
  MARKETPLACE_MAP_MOTION_DURATION,
} from '../motion'

export type OverlaySurface = 'search' | 'taskDetail'

export type OverlayCompactRecipe = {
  bottomH: string
  bottomImage: string
  /** CSS `bottom` for the bottom band. `0px` is the canvas edge. */
  bottomPos: string
}

export type OverlayWideRecipe = {
  leftW: string
  leftPos: string
  bottomH: string
  leftImage: string
  bottomImage: string
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
export const MAP_FADE_MOTION_DELAY = MARKETPLACE_MAP_MOTION_DELAY

const white = (alpha: number) => `rgba(255, 255, 255, ${alpha})`

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
export const MAP_FADE_WIDE_BOTTOM = mapFadeGradient('bottom')

/**
 * Compact task-detail map hero (StatusHeader spacer). The shared Mapbox
 * canvas is full-bleed; this is the visible window above overlapping chrome.
 * Offset camera padding uses the same pixel heights.
 */
export const COMPACT_DETAIL_HERO_H = {
  base: '300px',
  md: '360px',
} as const

/** Phone search: carousel-band wash only (no header fade). */
export const OVERLAY_MOBILE_SEARCH: OverlayCompactRecipe = {
  bottomH: '40%',
  bottomImage: MAP_FADE_BOTTOM,
  bottomPos: '0px',
}

/**
 * Phone/tablet task-detail: no map-canvas wash. The fade sits on the
 * sticky task-detail header so it travels with the title/tabs.
 */
export const OVERLAY_MOBILE_DETAIL: OverlayCompactRecipe = {
  bottomH: '0%',
  bottomImage: MAP_FADE_BOTTOM,
  bottomPos: '0px',
}

/**
 * Tablet uses the same compact (vertical) axis as phone. Search matches
 * until a dedicated tablet chrome lands.
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
  leftImage: MAP_FADE_LEFT,
  bottomImage: MAP_FADE_WIDE_BOTTOM,
}

/** Web task-detail: content column / camera split + lower cards. */
export const OVERLAY_WEB_DETAIL: OverlayWideRecipe = {
  leftW: '50%',
  leftPos: '0',
  bottomH: '50%',
  leftImage: MAP_FADE_LEFT,
  bottomImage: MAP_FADE_WIDE_BOTTOM,
}

/**
 * Lift Mapbox logo/attribution just above the full task-card carousel and the
 * glass nav. Search stays in the mobile shell until `lg`. 8.75rem ≈ card band.
 */
export const OVERLAY_CTRL_BOTTOM_OFFSET_COMPACT = `calc(${MOBILE_BOTTOM_NAV_CLEARANCE} + 8.75rem)`

export const COMPACT_SEARCH_BOTTOM_H = OVERLAY_MOBILE_SEARCH.bottomH
export const COMPACT_DETAIL_BOTTOM_H = OVERLAY_MOBILE_DETAIL.bottomH
export const SEARCH_MAP_LEFT_FADE_SIZE = OVERLAY_WEB_SEARCH.leftW
export const SEARCH_MAP_LEFT_FADE_POS = OVERLAY_WEB_SEARCH.leftPos
export const DETAIL_MAP_LEFT_FADE_SIZE = OVERLAY_WEB_DETAIL.leftW
export const DETAIL_MAP_BOTTOM_FADE_SIZE = OVERLAY_WEB_DETAIL.bottomH
