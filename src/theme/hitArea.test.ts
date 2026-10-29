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
})
