import { describe, expect, it } from 'vitest'

import { PINS_PATH_LINE_WIDTH, PINS_PATH_Z_INDEX } from './config'
import {
  pinsPathForMobile,
  pinsPathForTablet,
  pinsPathForViewport,
  pinsPathForWeb,
} from './pinsPath'

describe('pinsPath', () => {
  it('shows every pin while browsing on phone, tablet, and web', () => {
    const ctx = { inDetail: false, variant: 'exact' as const }
    expect(pinsPathForMobile(ctx).taskPinMode).toBe('all')
    expect(pinsPathForTablet(ctx).taskPinMode).toBe('all')
    expect(pinsPathForWeb(ctx).taskPinMode).toBe('all')
  })

  it('never hides browse pins for an approximate variant (search stays pin-only)', () => {
    const ctx = { inDetail: false, variant: 'approximate' as const }
    expect(pinsPathForMobile(ctx).taskPinMode).toBe('all')
    expect(pinsPathForTablet(ctx).taskPinMode).toBe('all')
    expect(pinsPathForWeb(ctx).taskPinMode).toBe('all')
  })

  it('solos the exact target pin in detail and hides pins for a zone', () => {
    expect(
      pinsPathForMobile({ inDetail: true, variant: 'exact' }).taskPinMode,
    ).toBe('solo')
    expect(
      pinsPathForTablet({ inDetail: true, variant: 'approximate' }).taskPinMode,
    ).toBe('none')
    expect(pinsPathForWeb({ inDetail: true, variant: 'exact' }).lineWidth).toBe(
      PINS_PATH_LINE_WIDTH.web,
    )
    expect(Number(PINS_PATH_Z_INDEX.selected)).toBeGreaterThan(
      Number(PINS_PATH_Z_INDEX.me),
    )
  })

  it('dispatches mobile / tablet / web from viewport', () => {
    const ctx = { inDetail: false, variant: 'exact' as const }
    expect(pinsPathForViewport('mobile', ctx)).toEqual(pinsPathForMobile(ctx))
    expect(pinsPathForViewport('tablet', ctx)).toEqual(pinsPathForTablet(ctx))
    expect(pinsPathForViewport('web', ctx)).toEqual(pinsPathForWeb(ctx))
  })
})
