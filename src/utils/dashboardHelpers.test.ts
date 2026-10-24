import { describe, expect, it } from 'vitest'

import { isQuoteAwarded } from './dashboardHelpers'

describe('isQuoteAwarded', () => {
  it('is true only for an accepted quote', () => {
    expect(isQuoteAwarded('ACCEPTED')).toBe(true)
    expect(isQuoteAwarded(' accepted ')).toBe(true)
  })

  it('treats a quote that did not win as not awarded', () => {
    for (const status of ['PENDING', 'WITHDRAWN', 'EXPIRED', 'CLOSED']) {
      expect(isQuoteAwarded(status)).toBe(false)
    }
  })
})
