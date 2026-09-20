import type { SystemStyleObject } from '@chakra-ui/react'

import { MARKETPLACE_MAP_MOTION_DELAY, marketplaceMapMotion } from '../motion'
import type { MarketplaceMapViewport } from '../viewport'
import {
  MAPBOX_CTRL_CONTAINER_CLASS,
  MAPBOX_CTRL_Z_INDEX,
  MAP_FADE_COMPACT_CLASS,
  MAP_FADE_WIDE_CLASS,
  MAP_FADE_Z_INDEX,
  OVERLAY_CTRL_BOTTOM_OFFSET_COMPACT,
  OVERLAY_MOBILE_DETAIL,
  OVERLAY_MOBILE_SEARCH,
  OVERLAY_TABLET_DETAIL,
  OVERLAY_TABLET_SEARCH,
  OVERLAY_WEB_DETAIL,
  OVERLAY_WEB_SEARCH,
  type OverlayCompactRecipe,
  type OverlaySurface,
  type OverlayWideRecipe,
} from './config'

export type { OverlaySurface } from './config'
export {
  COMPACT_DETAIL_BOTTOM_H,
  COMPACT_DETAIL_HERO_H,
  COMPACT_SEARCH_BOTTOM_H,
  DETAIL_MAP_BOTTOM_FADE_SIZE,
  DETAIL_MAP_LEFT_FADE_SIZE,
  MAPBOX_CTRL_CONTAINER_CLASS,
  MAPBOX_CTRL_Z_INDEX,
  MAP_FADE_BOTTOM,
  MAP_FADE_COMPACT_CLASS,
  MAP_FADE_LEFT,
  MAP_FADE_MOTION_DELAY,
  MAP_FADE_MOTION_DURATION,
  MAP_FADE_WIDE_CLASS,
  MAP_FADE_Z_INDEX,
  SEARCH_MAP_LEFT_FADE_POS,
  SEARCH_MAP_LEFT_FADE_SIZE,
  mapFadeGradient,
} from './config'

export const mapFadeOverlayMotion = marketplaceMapMotion

/**
 * Overlay follows the destination page, not the camera handoff.
 * Search → detail: keep the search wash until the detail route is on screen.
 * Detail → search: `overlayAhead: 'search'` starts the wash before search mounts.
 */
export function overlaySurfaceForSession(input: {
  onSearchPath: boolean
  onDetailPath: boolean
  overlayAhead: OverlaySurface | null
}): OverlaySurface {
  if (input.overlayAhead === 'search' || input.onSearchPath) return 'search'
  if (input.onDetailPath) return 'taskDetail'
  return 'search'
}

function motionCss(surface: OverlaySurface): SystemStyleObject {
  return {
    transitionProperty: marketplaceMapMotion.transitionProperty,
    transitionDuration: marketplaceMapMotion.duration,
    transitionTimingFunction: marketplaceMapMotion.easing,
    transitionDelay:
      surface === 'taskDetail' ? MARKETPLACE_MAP_MOTION_DELAY : '0ms',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  }
}

function bandBase(surface: OverlaySurface): SystemStyleObject {
  return {
    position: 'absolute',
    pointerEvents: 'none',
    ...motionCss(surface),
  }
}

const overlayRoot: SystemStyleObject = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: MAP_FADE_Z_INDEX,
}

function fadeRoot(className: string, slots: string[]) {
  const root = document.createElement('div')
  root.className = className
  root.setAttribute('aria-hidden', 'true')
  for (const slot of slots) {
    const el = document.createElement('div')
    el.setAttribute('data-map-fade', slot)
    root.append(el)
  }
  return root
}

/**
 * Compact (bottom) and wide (left/bottom) washes as siblings of the
 * canvas (above pins) and under `.mapboxgl-control-container` (zoom + logo).
 */
export function mountMapFadeOverlay(mapRoot: HTMLElement): () => void {
  const compact = fadeRoot(MAP_FADE_COMPACT_CLASS, ['bottom'])
  const wide = fadeRoot(MAP_FADE_WIDE_CLASS, ['left', 'bottom'])
  const ctrl = mapRoot.querySelector(`:scope > .${MAPBOX_CTRL_CONTAINER_CLASS}`)
  if (ctrl) {
    mapRoot.insertBefore(compact, ctrl)
    mapRoot.insertBefore(wide, ctrl)
  } else {
    mapRoot.append(compact, wide)
  }
  return () => {
    compact.remove()
    wide.remove()
  }
}

/**
 * Phone: compact bottom band on search (carousel). Task-detail compact wash
 * is on `StatusHeader`, so the map band collapses.
 */
export function overlayForMobile(
  surface: OverlaySurface,
): OverlayCompactRecipe {
  return surface === 'search' ? OVERLAY_MOBILE_SEARCH : OVERLAY_MOBILE_DETAIL
}

/**
 * Tablet: compact bottom band on the same axis as phone. Search matches
 * mobile; detail collapses the map band like phone.
 */
export function overlayForTablet(
  surface: OverlaySurface,
): OverlayCompactRecipe {
  return surface === 'search' ? OVERLAY_TABLET_SEARCH : OVERLAY_TABLET_DETAIL
}

/**
 * Web view: left wash (and optional bottom band on task detail). Grows on
 * the width axis, so it must not share a DOM node with compact bands.
 */
export function overlayForWeb(surface: OverlaySurface): OverlayWideRecipe {
  return surface === 'search' ? OVERLAY_WEB_SEARCH : OVERLAY_WEB_DETAIL
}

export function overlayForViewport(
  viewport: 'mobile' | 'tablet',
  surface: OverlaySurface,
): OverlayCompactRecipe
export function overlayForViewport(
  viewport: 'web',
  surface: OverlaySurface,
): OverlayWideRecipe
export function overlayForViewport(
  viewport: MarketplaceMapViewport,
  surface: OverlaySurface,
): OverlayCompactRecipe | OverlayWideRecipe {
  if (viewport === 'web') return overlayForWeb(surface)
  if (viewport === 'tablet') return overlayForTablet(surface)
  return overlayForMobile(surface)
}

function overlayCssForCompact(surface: OverlaySurface): SystemStyleObject {
  const mobile = overlayForMobile(surface)
  const tablet = overlayForTablet(surface)
  // `@starting-style` is valid CSS; Chakra's SystemStyleObject union does not
  // model it and overflows TS2590 once more Chakra-heavy modules are compiled.
  return {
    [`& .${MAP_FADE_COMPACT_CLASS}`]: {
      ...overlayRoot,
      display: { base: 'block', lg: 'none' },
      '& [data-map-fade="top"]': {
        display: 'none',
      },
      '& [data-map-fade="bottom"]': {
        ...bandBase(surface),
        top: 'auto',
        bottom: { base: mobile.bottomPos, md: tablet.bottomPos },
        left: 0,
        right: 0,
        height: { base: mobile.bottomH, md: tablet.bottomH },
        backgroundImage: {
          base: mobile.bottomImage,
          md: tablet.bottomImage,
        },
        '@starting-style': { height: '0px' },
      },
    },
  } as SystemStyleObject
}

function overlayCssForWebView(surface: OverlaySurface): SystemStyleObject {
  const web = overlayForWeb(surface)
  return {
    [`& .${MAP_FADE_WIDE_CLASS}`]: {
      ...overlayRoot,
      display: { base: 'none', lg: 'block' },
      '& [data-map-fade="left"]': {
        ...bandBase(surface),
        top: 0,
        bottom: 0,
        left: web.leftPos,
        width: web.leftW,
        backgroundImage: web.leftImage,
        '@starting-style': { width: '0px' },
      },
      '& [data-map-fade="bottom"]': {
        ...bandBase(surface),
        top: 'auto',
        bottom: 0,
        left: 0,
        right: 0,
        height: web.bottomH,
        backgroundImage: web.bottomImage,
        '@starting-style': { height: '0px' },
      },
    },
  } as SystemStyleObject
}

const overlayChromeStackCss: SystemStyleObject = {
  [`& .${MAPBOX_CTRL_CONTAINER_CLASS}`]: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: MAPBOX_CTRL_Z_INDEX,
  },
}

/**
 * Mapbox logo + compact attribution clustered in the corner. Shared chrome;
 * bottom lift for phone/tablet is `overlayCtrlBottomOffsetFor*`.
 */
export function overlayWatermarkCss(): SystemStyleObject {
  return {
    '& .mapboxgl-ctrl-bottom-right': {
      display: 'flex',
      flexDirection: 'row-reverse',
      alignItems: 'center',
      columnGap: '2px',
      right: '4px',
      pb: { lg: '4px' },
      '& .mapboxgl-ctrl': {
        float: 'none',
        clear: 'none',
        margin: 0,
      },
    },
    '& .mapboxgl-ctrl-logo': {
      margin: 0,
      width: '70px',
      height: '18px',
      backgroundSize: 'contain',
    },
    '& .mapboxgl-ctrl-attrib': {
      width: '24px',
      height: '24px',
      minW: '24px',
      minH: '24px',
      p: 0,
      m: 0,
      bg: 'transparent',
      position: 'relative',
    },
    '& .mapboxgl-ctrl-attrib.mapboxgl-compact-show': {
      width: 'auto',
      height: 'auto',
      bg: 'white',
      px: '2',
      pr: '7',
    },
    '& .mapboxgl-ctrl-attrib .mapboxgl-ctrl-attrib-button': {
      display: 'block',
    },
    '& .mapboxgl-ctrl-attrib:not(.mapboxgl-compact-show) .mapboxgl-ctrl-attrib-inner':
      {
        display: 'none',
      },
  }
}

/** Phone: lift logo/attribution above the carousel + glass nav. */
export function overlayCtrlBottomOffsetForMobile(): string {
  return OVERLAY_CTRL_BOTTOM_OFFSET_COMPACT
}

/** Tablet: same lift as phone (carousel still overlays the map below `lg`). */
export function overlayCtrlBottomOffsetForTablet(): string {
  return OVERLAY_CTRL_BOTTOM_OFFSET_COMPACT
}

/** Web view: Mapbox default corner; no extra bottom offset. */
export function overlayCtrlBottomOffsetForWeb(): undefined {
  return undefined
}

export function overlayCtrlBottomOffset(
  viewport: MarketplaceMapViewport,
  opts?: { inDetail?: boolean },
): string | undefined {
  if (opts?.inDetail) return undefined
  if (viewport === 'web') return overlayCtrlBottomOffsetForWeb()
  if (viewport === 'tablet') return overlayCtrlBottomOffsetForTablet()
  return overlayCtrlBottomOffsetForMobile()
}

/**
 * Compact bottom band for mobile + tablet; wide horizontal (+ desktop
 * bottom) bands from `lg`. Different elements so height and width animations
 * never interpolate across axes.
 */
export function overlayCss(surface: OverlaySurface): SystemStyleObject {
  return {
    ...overlayChromeStackCss,
    ...overlayCssForCompact(surface),
    ...overlayCssForWebView(surface),
  }
}

export function mapFadeOverlayCss(surface: OverlaySurface): SystemStyleObject {
  return overlayCss(surface)
}

export const SEARCH_MOBILE_MAP_CTRL_BOTTOM = overlayCtrlBottomOffsetForMobile()
export const SEARCH_MAPBOX_WATERMARK_CSS = overlayWatermarkCss()
