import { describe, expect, it } from 'vitest'

import { formSpace, hitAreaGrowth, minHitArea } from './styles'

describe('hitAreaGrowth', () => {
  it('is the 44px touch target', () => {
    expect(minHitArea).toBe(44)
  })

  it('grows a short row evenly, and takes the space back', () => {
    // A 20px checkbox row: 12 above and 12 below make 44.
    expect(hitAreaGrowth(20)).toEqual({
      pt: '12px',
      pb: '12px',
      mt: '-12px',
      mb: '-12px',
    })
  })

  it('reaches up only as far as asked, and the rest goes below', () => {
    // "Forgot password?" sits 4 under its field: 4 up to the field's edge, 20 down.
    expect(hitAreaGrowth(20, formSpace.controlToHelper)).toEqual({
      pt: '4px',
      pb: '20px',
      mt: '-4px',
      mb: '-20px',
    })
  })

  it('never adds layout space: padding and margin cancel', () => {
    for (const [height, above] of [
      [20, undefined],
      [20, 4],
      [21, 0],
      [36, 2],
    ] as const) {
      const grown = hitAreaGrowth(height, above)
      const px = (value: string | undefined) => Number.parseFloat(value ?? '0')
      expect(px(grown.pt) + px(grown.mt)).toBe(0)
      expect(px(grown.pb) + px(grown.mb)).toBe(0)
      expect(height + px(grown.pt) + px(grown.pb)).toBe(minHitArea)
    }
  })

  it('leaves a control that is already tall enough alone', () => {
    expect(hitAreaGrowth(44)).toEqual({})
    expect(hitAreaGrowth(48, 4)).toEqual({})
  })

  it('does not reach further up than the room it needs', () => {
    expect(hitAreaGrowth(40, 30)).toEqual({
      pt: '4px',
      pb: '0px',
      mt: '-4px',
      mb: '0px',
    })
  })

  it('`below` caps the reach down, so the target is short by what the gap lacks', () => {
    // A link under its field, above a row 20 away: 4 up, 20 down of the 24 it needs.
    expect(hitAreaGrowth(20, 4, 20)).toEqual({
      pt: '4px',
      pb: '20px',
      mt: '-4px',
      mb: '-20px',
    })
    expect(hitAreaGrowth(20, 0, 8)).toEqual({
      pt: '0px',
      pb: '8px',
      mt: '0px',
      mb: '-8px',
    })
  })

  it('rows that share a gap take half of it each and never overlap', () => {
    const gap = formSpace.alternativesGap
    const row = hitAreaGrowth(20, gap / 2, gap / 2)
    const px = (value: string | undefined) => Number.parseFloat(value ?? '0')
    // 20 + 4 + 4 = 28: the 12 above and below that 44 would take overlap the
    // neighbours by 16, and the lower row would win those pixels.
    expect(20 + px(row.pt) + px(row.pb)).toBe(28)
    expect(px(row.pb) + px(row.pt)).toBe(gap)
    // Without the cap two rows overlap by (24 - gap).
    const free = hitAreaGrowth(20)
    expect(px(free.pb) + px(free.pt)).toBeGreaterThan(gap)
  })

  it('the cap never adds layout space either: padding and margin cancel', () => {
    const grown = hitAreaGrowth(20, 4, 4)
    const px = (value: string | undefined) => Number.parseFloat(value ?? '0')
    expect(px(grown.pt) + px(grown.mt)).toBe(0)
    expect(px(grown.pb) + px(grown.mb)).toBe(0)
  })
})
