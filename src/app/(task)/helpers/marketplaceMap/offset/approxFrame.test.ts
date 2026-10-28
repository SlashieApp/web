import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { TASK_ZONE_RADIUS_M } from '../../taskMap/zoneCircle'
import {
  APPROX_CIRCLE_MAX_DIAMETER_PX,
  APPROX_PILL_ONE_LINE_PX,
  COMPACT_CHROME_OVERLAP_PX,
  approxCircleFrame,
  approxCircleZoom,
} from './approxFrame'
import { OFFSET_WEB } from './config'
import { marketplaceMapViewPadding, offsetPaddingForViewport } from './offset'

const dir = dirname(fileURLToPath(import.meta.url))

const LONDON = 51.5
const HONG_KONG = 22.3
const ONE_LINE = APPROX_PILL_ONE_LINE_PX
/** The pill wrapped to two lines (a 360 px phone, or a narrow window). */
const TWO_LINES = 46

/** The on-screen width of a circle of `radiusM` at this zoom and latitude, in px. */
function circleWidthPx(zoom: number, latDeg: number, radiusM = 400): number {
  const metresPerPx =
    (78271.517 * Math.cos((latDeg * Math.PI) / 180)) / 2 ** zoom
  return (2 * radiusM) / metresPerPx
}

describe('approxCircleZoom', () => {
  it('is about 12.57 for London with a 100 px circle', () => {
    expect(approxCircleZoom(LONDON, 100)).toBeCloseTo(12.57, 2)
  })

  it('is about 13.14 for Hong Kong, whose degree is longer', () => {
    expect(approxCircleZoom(HONG_KONG, 100)).toBeCloseTo(13.14, 2)
  })

  it('draws the circle at the width it was asked for, at any latitude', () => {
    for (const lat of [0, 22.3, 51.5, 55]) {
      for (const d of [40, 70, 100]) {
        expect(circleWidthPx(approxCircleZoom(lat, d), lat)).toBeCloseTo(d, 6)
      }
    }
  })

  it('gains a zoom level each time the circle doubles', () => {
    expect(
      approxCircleZoom(LONDON, 100) - approxCircleZoom(LONDON, 50),
    ).toBeCloseTo(1, 10)
  })

  it('stays finite for an empty window', () => {
    expect(Number.isFinite(approxCircleZoom(LONDON, 0))).toBe(true)
    expect(Number.isFinite(approxCircleZoom(LONDON, -20))).toBe(true)
  })

  it('uses the 400 m the API contract covers', () => {
    expect(TASK_ZONE_RADIUS_M).toBe(400)
  })
})

describe('approxCircleFrame, phone', () => {
  it('puts the circle above a one-line pill on 390 x 844', () => {
    const f = approxCircleFrame({
      viewport: 'mobile',
      width: 390,
      height: 844,
      pillHeight: ONE_LINE,
    })
    // Chrome top 300 - 148 = 152; the pill's bottom is 8 above it.
    expect(f.pill).toEqual({ top: 112, bottom: 144 })
    // The window runs from top + 4 to the pill's top - 6.
    expect(f.window).toEqual({ top: 4, bottom: 106 })
    expect(f.diameterPx).toBe(100)
    expect(f.centerX).toBe(195)
    expect(f.padding).toEqual({ top: 4, bottom: 738, left: 0, right: 0 })
  })

  it('shrinks the circle when the pill wraps to two lines', () => {
    const f = approxCircleFrame({
      viewport: 'mobile',
      width: 360,
      height: 740,
      pillHeight: TWO_LINES,
    })
    expect(f.pill).toEqual({ top: 98, bottom: 144 })
    expect(f.window).toEqual({ top: 4, bottom: 92 })
    expect(f.diameterPx).toBe(88)
    expect(f.padding.bottom).toBe(740 - 92)
  })

  it('adds the top inset (the app: the safe area) to the whole column', () => {
    const f = approxCircleFrame({
      viewport: 'mobile',
      width: 390,
      height: 844,
      pillHeight: ONE_LINE,
      topInset: 47,
    })
    expect(f.window.top).toBe(51)
    expect(f.pill.bottom).toBe(47 + 144)
    expect(f.diameterPx).toBe(100)
  })

  it('centres the circle in its window, so the camera padding is its window', () => {
    const f = approxCircleFrame({
      viewport: 'mobile',
      width: 390,
      height: 844,
      pillHeight: ONE_LINE,
    })
    const centreY = (f.window.top + f.window.bottom) / 2
    const paddedCentreY =
      f.padding.top + (844 - f.padding.top - f.padding.bottom) / 2
    expect(paddedCentreY).toBe(centreY)
  })
})

describe('approxCircleFrame, tablet', () => {
  it('uses the 360 px hero, so the chrome starts at 212', () => {
    const f = approxCircleFrame({
      viewport: 'tablet',
      width: 820,
      height: 1180,
      pillHeight: ONE_LINE,
    })
    expect(f.pill).toEqual({ top: 172, bottom: 204 })
    expect(f.window).toEqual({ top: 4, bottom: 166 })
    expect(f.diameterPx).toBe(100)
    expect(f.centerX).toBe(410)
    expect(f.padding).toEqual({ top: 4, bottom: 1014, left: 0, right: 0 })
  })
})

describe('approxCircleFrame, wide', () => {
  it('puts the circle in the right half, under a pill below the bar, on 1366 x 900', () => {
    const f = approxCircleFrame({
      viewport: 'web',
      width: 1366,
      height: 900,
      pillHeight: ONE_LINE,
    })
    // The 66 px app header, then the 56 px bar: the pill is 8 below that.
    expect(f.pill).toEqual({ top: 130, bottom: 162 })
    // The content starts where the 0.66 bottom inset ends: 900 - 594 = 306.
    expect(f.window).toEqual({ top: 168, bottom: 294 })
    expect(f.diameterPx).toBe(100)
    expect(f.padding).toEqual({ top: 168, bottom: 606, left: 683, right: 20 })
    // Half the width plus half of what is left of the right half.
    expect(f.centerX).toBe(683 + (1366 - 683 - 20) / 2)
  })

  it('shrinks the circle on a short window instead of crowding the pill', () => {
    const f = approxCircleFrame({
      viewport: 'web',
      width: 1280,
      height: 720,
      pillHeight: ONE_LINE,
    })
    expect(f.window).toEqual({ top: 168, bottom: 233 })
    expect(f.diameterPx).toBe(65)
  })

  it('uses web’s existing approximate bottom ratio for the content top', () => {
    expect(OFFSET_WEB.bottomRatio.approximate).toBe(0.66)
    const f = approxCircleFrame({
      viewport: 'web',
      width: 1440,
      height: 1000,
      pillHeight: ONE_LINE,
    })
    expect(f.window.bottom).toBe(1000 - Math.round(1000 * 0.66) - 12)
  })

  it('never makes the circle wider than 100 px or narrower than nothing', () => {
    const tall = approxCircleFrame({
      viewport: 'web',
      width: 1920,
      height: 1400,
      pillHeight: ONE_LINE,
    })
    expect(tall.diameterPx).toBe(APPROX_CIRCLE_MAX_DIAMETER_PX)
    const tiny = approxCircleFrame({
      viewport: 'web',
      width: 1100,
      height: 300,
      pillHeight: ONE_LINE,
    })
    expect(tiny.diameterPx).toBe(0)
  })
})

describe('the approximate variant of the view padding', () => {
  it('routes the approximate variant through the circle frame at every width', () => {
    expect(marketplaceMapViewPadding(390, 844, 'approximate')).toEqual(
      approxCircleFrame({
        viewport: 'mobile',
        width: 390,
        height: 844,
        pillHeight: ONE_LINE,
      }).padding,
    )
    expect(marketplaceMapViewPadding(820, 1180, 'approximate')?.bottom).toBe(
      1014,
    )
    expect(marketplaceMapViewPadding(1366, 900, 'approximate')?.top).toBe(168)
  })

  it('takes the measured pill height', () => {
    expect(
      marketplaceMapViewPadding(360, 740, 'approximate', TWO_LINES)?.bottom,
    ).toBe(740 - 92)
  })

  it('leaves the exact padding exactly as it was', () => {
    expect(offsetPaddingForViewport('mobile', 390, 844, 'exact')).toEqual({
      top: 48,
      left: 16,
      right: 20,
      bottom: 544,
    })
    expect(offsetPaddingForViewport('web', 1366, 900, 'exact')).toEqual({
      top: 58,
      left: 683,
      right: 20,
      bottom: 522,
    })
  })
})

describe('the chrome overlap', () => {
  it('is the 9.25rem the page pulls its content up by', () => {
    expect(COMPACT_CHROME_OVERLAP_PX).toBe(9.25 * 16)
    const view = readFileSync(
      join(dir, '../../../tasks/[slug]/components/layout/TaskDetailView.tsx'),
      'utf8',
    )
    expect(view).toContain("MOBILE_MAP_CHROME_OVERLAP = '-9.25rem'")
  })
})
