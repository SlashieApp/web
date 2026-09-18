import { describe, expect, it } from 'vitest'

import { OFFSET_MOBILE, OFFSET_TABLET, OFFSET_WEB } from './config'
import {
  marketplaceMapViewPadding,
  offsetPaddingForMobile,
  offsetPaddingForTablet,
  offsetPaddingForWeb,
} from './offset'

describe('offsetPaddingForMobile', () => {
  it('pins the task in the upper hero band', () => {
    const padding = offsetPaddingForMobile(390, 800)
    expect(padding.top).toBe(OFFSET_MOBILE.top)
    expect(padding.bottom).toBe(800 - OFFSET_MOBILE.heroMax)
  })
})

describe('offsetPaddingForTablet', () => {
  it('uses the compact hero-band recipe below lg', () => {
    const padding = offsetPaddingForTablet(800, 800)
    expect(padding.top).toBe(OFFSET_TABLET.top)
    expect(padding.bottom).toBe(800 - OFFSET_TABLET.heroMax)
  })
})

describe('offsetPaddingForWeb', () => {
  it('frames the pin in the top-right quadrant', () => {
    const padding = offsetPaddingForWeb(1400, 800, 'exact')
    expect(padding.left).toBe(700)
    expect(padding.top).toBe(OFFSET_WEB.top)
    expect(padding.bottom).toBe(Math.round(800 * OFFSET_WEB.bottomRatio.exact))
  })
})

describe('marketplaceMapViewPadding', () => {
  it('dispatches mobile / tablet / web from width', () => {
    expect(marketplaceMapViewPadding(390, 800, 'exact')?.top).toBe(
      OFFSET_MOBILE.top,
    )
    expect(marketplaceMapViewPadding(800, 800, 'exact')?.top).toBe(
      OFFSET_TABLET.top,
    )
    expect(marketplaceMapViewPadding(1400, 800, 'exact')?.left).toBe(700)
  })
})
