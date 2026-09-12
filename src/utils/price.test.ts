import { describe, expect, it } from 'vitest'

import { formatGbpMajor } from './price'

describe('formatGbpMajor', () => {
  it('formats whole pounds with a sterling sign and UK grouping', () => {
    expect(formatGbpMajor(0)).toBe('£0')
    expect(formatGbpMajor(150)).toBe('£150')
    expect(formatGbpMajor(1500)).toBe('£1,500')
  })

  it('rounds fractional pounds', () => {
    expect(formatGbpMajor(149.6)).toBe('£150')
  })
})
