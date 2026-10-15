import { MOBILE_BOTTOM_NAV_CLEARANCE } from '@/ui/MobileBottomNav/mobileBottomNavLayout'

import {
  MARKETPLACE_MAP_MOTION_DELAY,
  MARKETPLACE_MAP_MOTION_DURATION,
} from '../motion'

export type OverlaySurface = 'search' | 'taskDetail'

export type OverlayCompactRecipe = {
  /** Top band behind the floating search chrome; `0px` hides it. */
  topH: string
  topImage: string
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
/** The wash's solid edge, for bands that continue it (task-detail chips). */
export const MAP_FADE_EDGE = white(0.92)

export const MAP_FADE_BOTTOM = `linear-gradient(to top, ${MAP_FADE_EDGE} 0%, ${white(0.5)} 48%, ${white(0)} 100%)`

/** The same wash from the top, behind the logo and search bar (FE-208). */
export const MAP_FADE_TOP = `linear-gradient(to bottom, ${white(0.92)} 0%, ${white(0.5)} 48%, ${white(0)} 100%)`

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

/** Phone search: top wash behind the logo and search bar, carousel wash below. */
export const OVERLAY_MOBILE_SEARCH: OverlayCompactRecipe = {
  topH: '200px',
  topImage: MAP_FADE_TOP,
  bottomH: '40%',
  bottomImage: MAP_FADE_BOTTOM,
  bottomPos: '0px',
}

/**
 * Phone/tablet task-detail: no map-canvas wash. The fade sits on the
 * sticky task-detail header so it travels with the title/tabs.
 */
export const OVERLAY_MOBILE_DETAIL: OverlayCompactRecipe = {
  topH: '0px',
  topImage: MAP_FADE_TOP,
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
 * Measured height of search's bottom chrome (Search this area + task card),
 * set by the phone/tablet search layout. The card's height varies (button
 * shown, title wrapping), so the Mapbox mark reads the real value.
 */
export const SEARCH_BOTTOM_CHROME_VAR = '--search-bottom-chrome'

/**
 * Lift Mapbox logo/attribution just above the task-card stack and the glass
 * nav. Search stays in the mobile shell until `lg`. 8.75rem ≈ card band until
 * the first measurement lands.
 */
export const OVERLAY_CTRL_BOTTOM_OFFSET_COMPACT = `calc(${MOBILE_BOTTOM_NAV_CLEARANCE} + var(${SEARCH_BOTTOM_CHROME_VAR}, 8.75rem) + 0.5rem)`

export const COMPACT_SEARCH_BOTTOM_H = OVERLAY_MOBILE_SEARCH.bottomH
export const COMPACT_SEARCH_TOP_H = OVERLAY_MOBILE_SEARCH.topH
export const COMPACT_DETAIL_BOTTOM_H = OVERLAY_MOBILE_DETAIL.bottomH
export const SEARCH_MAP_LEFT_FADE_SIZE = OVERLAY_WEB_SEARCH.leftW
export const SEARCH_MAP_LEFT_FADE_POS = OVERLAY_WEB_SEARCH.leftPos
export const DETAIL_MAP_LEFT_FADE_SIZE = OVERLAY_WEB_DETAIL.leftW
export const DETAIL_MAP_BOTTOM_FADE_SIZE = OVERLAY_WEB_DETAIL.bottomH
