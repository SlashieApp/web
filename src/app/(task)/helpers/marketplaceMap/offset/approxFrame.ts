/**
 * Framing for the approximate area on task detail (FE-472): a 400 m circle,
 * no pin, and a pill that says it is approximate. The camera puts the circle
 * in a small window the page leaves clear, with the pill beside it:
 *
 * - Compact (below lg): the clear column runs from the top of the hero to the
 *   top of the title chrome. The pill sits centred, just above that chrome,
 *   and the circle in the window above the pill.
 * - Wide (lg and up): the circle sits in the right half's camera window. The
 *   pill is above it, under the bar.
 *
 * The same numbers and the same rules as the app's `approxFrame`. Pure: all
 * lengths are CSS px.
 */

import { BAR_H } from '@/ui/StickyHeader/headerCollapse'

import { TASK_ZONE_RADIUS_M } from '../../taskMap/zoneCircle'
import { COMPACT_DETAIL_HERO_H } from '../overlay/config'
import type { MarketplaceMapViewport } from '../viewport'
import { OFFSET_WEB, type OffsetPadding } from './config'

/** The circle is at most this wide on screen; a smaller window makes it smaller. */
export const APPROX_CIRCLE_MAX_DIAMETER_PX = 100

/** The title chrome covers the lower 9.25rem of the hero (`MOBILE_MAP_CHROME_OVERLAP`). */
export const COMPACT_CHROME_OVERLAP_PX = 148

/** Compact: the circle window starts this far below the top inset. */
export const APPROX_CIRCLE_TOP_GAP_PX = 4
/** Compact: the pill's bottom edge is this far above the chrome's top. */
export const APPROX_PILL_ABOVE_CHROME_PX = 8
/** Between the pill and the circle window. */
export const APPROX_PILL_CIRCLE_GAP_PX = 6
/** Wide: the pill's top is this far below the bar. */
export const APPROX_PILL_BELOW_BAR_PX = 8
/** Wide: the circle window ends this far above the content. */
export const APPROX_CIRCLE_ABOVE_CONTENT_PX = 12

/**
 * Web from lg: the app header over the page (its 64px minimum height and two
 * 1px borders, measured at 66), above the 56px bar.
 */
export const WEB_APP_HEADER_PX = 66

/** The pill on one line (it is `min-height` 32 px). Two lines are taller. */
export const APPROX_PILL_ONE_LINE_PX = 32

/** Mapbox GL metres per pixel at zoom 0, at the equator (512 px tiles). */
const METRES_PER_PX_AT_ZOOM_0 = 78271.517

/**
 * The zoom at which a circle of `radiusM` metres is `diameterPx` wide on
 * screen at this latitude. London (51.5 N) at 100 px is about 12.57.
 */
export function approxCircleZoom(
  latDeg: number,
  diameterPx: number,
  radiusM: number = TASK_ZONE_RADIUS_M,
): number {
  const cosLat = Math.cos((latDeg * Math.PI) / 180)
  return Math.log2(
    (Math.max(diameterPx, 1) * METRES_PER_PX_AT_ZOOM_0 * cosLat) /
      (2 * radiusM),
  )
}

export type ApproxFrameInput = {
  viewport: MarketplaceMapViewport
  width: number
  height: number
  /** The pill's height: one line is `APPROX_PILL_ONE_LINE_PX`, two lines are taller. */
  pillHeight: number
  /**
   * Space above the bar: compact, the safe-area inset (0 on web); wide, the
   * app header above the bar (`WEB_APP_HEADER_PX` on web).
   */
  topInset?: number
}

export type ApproxFrame = {
  /** Mapbox padding whose window is the circle's window. */
  padding: Required<OffsetPadding>
  /** The circle's on-screen width: `min(100, window height)`. */
  diameterPx: number
  /** The circle's centre x, which the pill is centred on. */
  centerX: number
  /** The circle's window, y from the top of the viewport. */
  window: { top: number; bottom: number }
  /** The pill's box, y from the top of the viewport. */
  pill: { top: number; bottom: number }
}

function frame(input: {
  width: number
  height: number
  left: number
  right: number
  windowTop: number
  windowBottom: number
  pillTop: number
  pillBottom: number
}): ApproxFrame {
  const windowH = Math.max(0, input.windowBottom - input.windowTop)
  return {
    padding: {
      top: input.windowTop,
      bottom: input.height - input.windowBottom,
      left: input.left,
      right: input.right,
    },
    diameterPx: Math.min(APPROX_CIRCLE_MAX_DIAMETER_PX, windowH),
    centerX: input.left + (input.width - input.left - input.right) / 2,
    window: { top: input.windowTop, bottom: input.windowBottom },
    pill: { top: input.pillTop, bottom: input.pillBottom },
  }
}

export function approxCircleFrame(input: ApproxFrameInput): ApproxFrame {
  const { viewport, width, height, pillHeight } = input

  if (viewport === 'web') {
    const topInset = input.topInset ?? WEB_APP_HEADER_PX
    const pillTop = topInset + BAR_H + APPROX_PILL_BELOW_BAR_PX
    const pillBottom = pillTop + pillHeight
    // The camera window's bottom is web's approximate ratio (0.66 of the
    // height is the bottom inset); the content starts there.
    const contentTop =
      height - Math.round(height * OFFSET_WEB.bottomRatio.approximate)
    return frame({
      width,
      height,
      left: Math.round(width * OFFSET_WEB.leftRatio),
      right: OFFSET_WEB.right,
      windowTop: pillBottom + APPROX_PILL_CIRCLE_GAP_PX,
      windowBottom: contentTop - APPROX_CIRCLE_ABOVE_CONTENT_PX,
      pillTop,
      pillBottom,
    })
  }

  const topInset = input.topInset ?? 0
  const hero = Number.parseInt(
    viewport === 'tablet'
      ? COMPACT_DETAIL_HERO_H.md
      : COMPACT_DETAIL_HERO_H.base,
    10,
  )
  const chromeTop = topInset + hero - COMPACT_CHROME_OVERLAP_PX
  const pillBottom = chromeTop - APPROX_PILL_ABOVE_CHROME_PX
  const pillTop = pillBottom - pillHeight
  return frame({
    width,
    height,
    left: 0,
    right: 0,
    windowTop: topInset + APPROX_CIRCLE_TOP_GAP_PX,
    windowBottom: pillTop - APPROX_PILL_CIRCLE_GAP_PX,
    pillTop,
    pillBottom,
  })
}
