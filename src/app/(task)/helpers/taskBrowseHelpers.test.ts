import { describe, expect, it } from 'vitest'

import {
  buildActiveBrowseFilterTags,
  formatBrowseBudgetRange,
} from './taskBrowseHelpers'

describe('formatBrowseBudgetRange', () => {
  it('defaults to an open-ended sterling range', () => {
    expect(formatBrowseBudgetRange('', '')).toBe('£0 - £150+')
  })

  it('formats a closed range with UK grouping', () => {
    expect(formatBrowseBudgetRange('50', '300')).toBe('£50 - £300')
    expect(formatBrowseBudgetRange('1000', '1500')).toBe('£1,000 - £1,500')
  })

  it('keeps the open-ended cap when only a minimum is set', () => {
    expect(formatBrowseBudgetRange('40', '')).toBe('£40 - £150+')
  })
})

describe('buildActiveBrowseFilterTags', () => {
  it('uses sterling on the budget chip', () => {
    const tags = buildActiveBrowseFilterTags({
      submittedRadiusMiles: 10,
      submittedMinBudget: '25',
      submittedMaxBudget: '',
      submittedUrgency: 'any',
      submittedCategory: '',
      submittedScheduledAfter: '',
      submittedScheduledBefore: '',
      submittedSearchText: '',
      referenceLabel: '',
    })

    expect(tags.find((tag) => tag.kind === 'budget')?.label).toBe('£25 - £150+')
    expect(tags.some((tag) => tag.label.includes('$'))).toBe(false)
  })
})
