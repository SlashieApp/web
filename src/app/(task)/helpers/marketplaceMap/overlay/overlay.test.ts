import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { PIN_Z_INDEX } from '../../taskMap/pin/styles'
import {
  COMPACT_DETAIL_BOTTOM_H,
  COMPACT_DETAIL_TOP_H,
  COMPACT_SEARCH_BOTTOM_H,
  COMPACT_SEARCH_TOP_H,
  DETAIL_MAP_BOTTOM_FADE_SIZE,
  DETAIL_MAP_LEFT_FADE_SIZE,
  MAPBOX_CTRL_CONTAINER_CLASS,
  MAPBOX_CTRL_Z_INDEX,
  MAP_FADE_BOTTOM,
  MAP_FADE_COMPACT_CLASS,
  MAP_FADE_MOTION_DURATION,
  MAP_FADE_TOP,
  MAP_FADE_WIDE_CLASS,
  MAP_FADE_Z_INDEX,
  SEARCH_MAP_LEFT_FADE_POS,
  SEARCH_MAP_LEFT_FADE_SIZE,
} from './config'
import {
  mapFadeGradient,
  mapFadeOverlayCss,
  mapFadeOverlayMotion,
  overlayCtrlBottomOffsetForMobile,
  overlayCtrlBottomOffsetForTablet,
  overlayCtrlBottomOffsetForWeb,
  overlayForMobile,
  overlayForTablet,
  overlayForWeb,
} from './overlay'

const dir = dirname(fileURLToPath(import.meta.url))

function css(surface: Parameters<typeof mapFadeOverlayCss>[0]) {
  return mapFadeOverlayCss(surface) as Record<string, Record<string, unknown>>
}

describe('overlayForMobile / overlayForTablet / overlayForWeb', () => {
  it('keeps compact vertical bands on phone and tablet, wide wash on web', () => {
    expect(overlayForMobile('search')).toEqual({
      topH: COMPACT_SEARCH_TOP_H,
      bottomH: COMPACT_SEARCH_BOTTOM_H,
    })
    expect(overlayForTablet('search')).toEqual(overlayForMobile('search'))
    expect(overlayForMobile('taskDetail')).toEqual({
      topH: COMPACT_DETAIL_TOP_H,
      bottomH: COMPACT_DETAIL_BOTTOM_H,
    })
    expect(overlayForWeb('search')).toEqual({
      leftW: SEARCH_MAP_LEFT_FADE_SIZE,
      leftPos: SEARCH_MAP_LEFT_FADE_POS,
      bottomH: '0%',
    })
    expect(overlayForWeb('taskDetail').leftW).toBe(DETAIL_MAP_LEFT_FADE_SIZE)
    expect(overlayForWeb('taskDetail').bottomH).toBe(
      DETAIL_MAP_BOTTOM_FADE_SIZE,
    )
  })

  it('lifts Mapbox chrome on phone and tablet only', () => {
    expect(overlayCtrlBottomOffsetForMobile()).toContain('7.5rem')
    expect(overlayCtrlBottomOffsetForTablet()).toBe(
      overlayCtrlBottomOffsetForMobile(),
    )
    expect(overlayCtrlBottomOffsetForWeb()).toBeUndefined()
  })
})

describe('mapFadeGradient', () => {
  it('puts full white on the window side and 0 facing the content', () => {
    expect(
      mapFadeGradient('left').startsWith('linear-gradient(to right,'),
    ).toBe(true)
    expect(
      mapFadeGradient('bottom').startsWith('linear-gradient(to top,'),
    ).toBe(true)
    expect(
      mapFadeGradient('left').endsWith('rgba(255, 255, 255, 0) 100%)'),
    ).toBe(true)
  })
})

describe('overlayCss', () => {
  it('keeps compact top/bottom bands on their own elements, at the original sizes', () => {
    const search = css('search')
    const detail = css('taskDetail')
    const compactSearch = search[`& .${MAP_FADE_COMPACT_CLASS}`]
    const compactDetail = detail[`& .${MAP_FADE_COMPACT_CLASS}`]
    const searchTop = compactSearch['& [data-map-fade="top"]'] as Record<
      string,
      unknown
    >
    const searchBottom = compactSearch['& [data-map-fade="bottom"]'] as Record<
      string,
      unknown
    >
    const detailTop = compactDetail['& [data-map-fade="top"]'] as Record<
      string,
      unknown
    >
    const detailBottom = compactDetail['& [data-map-fade="bottom"]'] as Record<
      string,
      unknown
    >

    expect(compactSearch.display).toMatchObject({ base: 'block', lg: 'none' })
    expect(compactSearch.zIndex).toBe(MAP_FADE_Z_INDEX)
    expect(MAP_FADE_Z_INDEX).toBeGreaterThan(Number(PIN_Z_INDEX.selected))
    expect(MAPBOX_CTRL_Z_INDEX).toBeGreaterThan(MAP_FADE_Z_INDEX)
    expect(search[`& .${MAPBOX_CTRL_CONTAINER_CLASS}`]).toMatchObject({
      zIndex: MAPBOX_CTRL_Z_INDEX,
    })
    expect(MAPBOX_CTRL_CONTAINER_CLASS).toBe('mapboxgl-control-container')
    expect(searchTop.height).toEqual({
      base: overlayForMobile('search').topH,
      md: overlayForTablet('search').topH,
    })
    expect(searchBottom.height).toEqual({
      base: overlayForMobile('search').bottomH,
      md: overlayForTablet('search').bottomH,
    })
    expect(detailTop.height).toEqual({
      base: overlayForMobile('taskDetail').topH,
      md: overlayForTablet('taskDetail').topH,
    })
    expect(detailBottom.height).toEqual({
      base: overlayForMobile('taskDetail').bottomH,
      md: overlayForTablet('taskDetail').bottomH,
    })
    expect(searchTop.backgroundImage).toBe(MAP_FADE_TOP)
    expect(searchBottom.backgroundImage).toBe(MAP_FADE_BOTTOM)
    expect(COMPACT_SEARCH_TOP_H).toBe('30%')
    expect(COMPACT_SEARCH_BOTTOM_H).toBe('40%')
    expect(MAP_FADE_TOP).toContain('0.55')
    expect(MAP_FADE_BOTTOM).toContain('0.5) 48%')
  })

  it('keeps the desktop left wash on a separate wide element', () => {
    const search = css('search')
    const detail = css('taskDetail')
    const wideSearch = search[`& .${MAP_FADE_WIDE_CLASS}`]
    const wideDetail = detail[`& .${MAP_FADE_WIDE_CLASS}`]
    const searchLeft = wideSearch['& [data-map-fade="left"]'] as Record<
      string,
      unknown
    >
    const detailLeft = wideDetail['& [data-map-fade="left"]'] as Record<
      string,
      unknown
    >
    const searchBottom = wideSearch['& [data-map-fade="bottom"]'] as Record<
      string,
      unknown
    >
    const detailBottom = wideDetail['& [data-map-fade="bottom"]'] as Record<
      string,
      unknown
    >

    expect(wideSearch.display).toMatchObject({ base: 'none', lg: 'block' })
    expect(searchLeft.width).toBe(overlayForWeb('search').leftW)
    expect(searchLeft.left).toBe(overlayForWeb('search').leftPos)
    expect(SEARCH_MAP_LEFT_FADE_SIZE).toBe('50%')
    expect(SEARCH_MAP_LEFT_FADE_POS).toBe('0')
    expect(detailLeft.width).toBe(overlayForWeb('taskDetail').leftW)
    expect(searchBottom.height).toBe(overlayForWeb('search').bottomH)
    expect(detailBottom.height).toBe(overlayForWeb('taskDetail').bottomH)
    expect(searchLeft.transitionProperty).toBe(
      mapFadeOverlayMotion.transitionProperty,
    )
    expect(searchLeft.transitionDuration).toBe(MAP_FADE_MOTION_DURATION)
    expect(JSON.stringify(searchLeft['@starting-style'])).toContain('0px')
  })

  it('is wired onto the shared marketplace map host and mounted in the canvas', () => {
    const host = readFileSync(
      join(dir, '../../../context/MarketplaceMapSession.tsx'),
      'utf8',
    )
    const overlay = readFileSync(join(dir, 'overlay.ts'), 'utf8')
    const controller = readFileSync(
      join(dir, '../../taskMap/controller.ts'),
      'utf8',
    )
    const searchLayout = readFileSync(
      join(dir, '../../../search/components/SearchLayouts.tsx'),
      'utf8',
    )
    expect(host).toContain(
      "mapFadeOverlayCss(inDetail ? 'taskDetail' : 'search')",
    )
    expect(controller).toContain('mountMapFadeOverlay')
    expect(controller).toContain('getContainer()')
    expect(overlay).toContain('MAP_FADE_COMPACT_CLASS')
    expect(overlay).toContain('MAP_FADE_WIDE_CLASS')
    expect(overlay).toContain('overlayForMobile')
    expect(overlay).toContain('overlayForTablet')
    expect(overlay).toContain('overlayForWeb')
    expect(searchLayout).not.toContain('linear-gradient')
  })
})
