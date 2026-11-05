import { describe, expect, it } from 'vitest'

import { chakraBreakpoints } from './breakpoints'
import { lightSystem } from './chakraSystem'
import {
  PAGE_CONTAINER_MAX_W_CSS,
  PAGE_GUTTER_PX,
  PAGE_GUTTER_X,
  READABLE_COLUMN_MAX_W_CSS,
  STATUS_CARD_MAX_W_CSS,
  logoLineLeft,
  menuLineRight,
  pageGutterPx,
} from './pageContainer'

describe('page measures', () => {
  it('has the sizes the layout rules name', () => {
    expect(PAGE_CONTAINER_MAX_W_CSS).toBe('80rem')
    // R3: the readable column is 720px.
    expect(READABLE_COLUMN_MAX_W_CSS).toBe('45rem')
    // R6: one card width, 448px, the auth card and the status card both.
    expect(STATUS_CARD_MAX_W_CSS).toBe('28rem')
  })

  it('registers them as size tokens, so maxW="pageColumn" and "statusCard" resolve', () => {
    expect(lightSystem.token('sizes.page')).toBe(PAGE_CONTAINER_MAX_W_CSS)
    expect(lightSystem.token('sizes.pageColumn')).toBe(
      READABLE_COLUMN_MAX_W_CSS,
    )
    expect(lightSystem.token('sizes.statusCard')).toBe(STATUS_CARD_MAX_W_CSS)
  })

  it('keeps the px gutters in step with the spacing gutters (a step is 4px)', () => {
    expect(PAGE_GUTTER_PX.base).toBe(PAGE_GUTTER_X.base * 4)
    expect(PAGE_GUTTER_PX.md).toBe(PAGE_GUTTER_X.md * 4)
    expect(PAGE_GUTTER_PX.lg).toBe(PAGE_GUTTER_X.lg * 4)
  })
})

describe('pageGutterPx', () => {
  it('is 16 below md, 24 from md, 32 from lg', () => {
    expect(pageGutterPx(375)).toBe(16)
    expect(pageGutterPx(767)).toBe(16)
    expect(pageGutterPx(768)).toBe(24)
    expect(pageGutterPx(1023)).toBe(24)
    expect(pageGutterPx(1024)).toBe(32)
    expect(pageGutterPx(1920)).toBe(32)
  })

  it('switches at the theme breakpoints', () => {
    expect(chakraBreakpoints.md).toBe('768px')
    expect(chakraBreakpoints.lg).toBe('1024px')
  })
})

describe('logo and menu lines', () => {
  it('is the gutter while the viewport is narrower than the container', () => {
    expect(logoLineLeft(390)).toBe(16)
    expect(logoLineLeft(820)).toBe(24)
    expect(logoLineLeft(1024)).toBe(32)
    expect(logoLineLeft(1280)).toBe(32)
  })

  it('adds half of what the viewport has beyond 80rem', () => {
    // Measured on the real header in the layout audit.
    expect(logoLineLeft(1366)).toBe(75)
    expect(logoLineLeft(1920)).toBe(352)
  })

  it('mirrors the logo line on the right', () => {
    expect(menuLineRight(390)).toBe(374)
    expect(menuLineRight(1366)).toBe(1291)
    expect(menuLineRight(1920)).toBe(1568)
  })
})
