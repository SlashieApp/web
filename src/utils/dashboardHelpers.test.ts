import { describe, expect, it } from 'vitest'

import { isQuoteAwarded } from './dashboardHelpers'

describe('isQuoteAwarded', () => {
  it('is true only for an accepted quote', () => {
    expect(isQuoteAwarded('ACCEPTED')).toBe(true)
    expect(isQuoteAwarded(' accepted ')).toBe(true)
  })

  it('treats a quote that lost as not awarded', () => {
    expect(isQuoteAwarded('NOT_SELECTED')).toBe(false)
    expect(isQuoteAwarded('PENDING')).toBe(false)
    expect(isQuoteAwarded('DECLINED')).toBe(false)
  })
})
