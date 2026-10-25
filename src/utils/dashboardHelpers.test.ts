import { QuoteStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { isQuoteAwarded } from './dashboardHelpers'

describe('isQuoteAwarded', () => {
  it('is true only for an accepted quote', () => {
    expect(isQuoteAwarded('ACCEPTED')).toBe(true)
    expect(isQuoteAwarded(' accepted ')).toBe(true)
  })

  it('treats a quote that did not win as not awarded', () => {
    for (const status of [
      QuoteStatus.Pending,
      QuoteStatus.Withdrawn,
      QuoteStatus.Expired,
      QuoteStatus.Closed,
    ]) {
      expect(isQuoteAwarded(status)).toBe(false)
    }
  })
})
