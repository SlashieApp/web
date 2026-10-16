import { describe, expect, it } from 'vitest'

import {
  formatPricingAmount,
  pricingIntervalLabel,
  pricingTrialLength,
} from './formatPricing'

describe('formatPricingAmount', () => {
  it('shows pence only when there are some', () => {
    expect(formatPricingAmount(1999, 'gbp')).toBe('£19.99')
    expect(formatPricingAmount(2000, 'gbp')).toBe('£20')
    expect(formatPricingAmount(0, 'gbp')).toBe('£0')
  })
})

describe('pricingIntervalLabel', () => {
  const labels = { month: '月', year: '年' }

  it('translates month and year, and passes anything else through', () => {
    expect(pricingIntervalLabel(' Month ', labels)).toBe('月')
    expect(pricingIntervalLabel('year', labels)).toBe('年')
    expect(pricingIntervalLabel('week', labels)).toBe('week')
  })
})

describe('pricingTrialLength', () => {
  it('reads whole 30-day blocks as months', () => {
    expect(pricingTrialLength(180)).toEqual({ unit: 'months', count: 6 })
    expect(pricingTrialLength(30)).toEqual({ unit: 'month', count: 1 })
  })

  it('falls back to days', () => {
    expect(pricingTrialLength(14)).toEqual({ unit: 'days', count: 14 })
  })

  it('is null when there is no trial', () => {
    expect(pricingTrialLength(null)).toBeNull()
    expect(pricingTrialLength(0)).toBeNull()
  })
})
