import { describe, expect, it } from 'vitest'

import bag from '../i11n.json'
import {
  formatPricingAmount,
  pricingIntervalCount,
  pricingPerInterval,
  pricingPriceLine,
  pricingTrialLength,
} from './formatPricing'
import type { PricingRecord } from './getPricingForPage'

describe('formatPricingAmount', () => {
  it('shows pence only when there are some', () => {
    expect(formatPricingAmount(1999, 'gbp')).toBe('£19.99')
    expect(formatPricingAmount(2000, 'gbp')).toBe('£20')
    expect(formatPricingAmount(0, 'gbp')).toBe('£0')
  })
})

describe('pricingPerInterval', () => {
  it('translates month and year, and passes anything else through', () => {
    const zh = bag.zh_hk.intervals
    expect(
      pricingPerInterval(
        { priceInterval: ' Month ', priceIntervalCount: 1 },
        zh,
      ),
    ).toBe('/ 月')
    expect(
      pricingPerInterval({ priceInterval: 'week', priceIntervalCount: 1 }, zh),
    ).toBe('/ week')
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

/** £19.99 a month, as the live API returns it. */
const storyPricing: PricingRecord = {
  productName: 'Slashie Unlimited',
  priceAmount: 1999,
  priceCurrency: 'gbp',
  priceInterval: 'month',
  priceIntervalCount: 1,
  trialDays: 180,
  trialLabel: '6 months free',
  freeQuotesPerMonth: 3,
}

describe('price per interval', () => {
  const quarterly = {
    ...storyPricing,
    priceAmount: 5400,
    priceIntervalCount: 3,
  }

  it('reads one interval as today', () => {
    expect(pricingPerInterval(storyPricing, bag.en.intervals)).toBe('/ month')
    expect(pricingPriceLine(storyPricing, bag.en.intervals)).toBe(
      '£19.99 / month',
    )
    expect(pricingPriceLine(storyPricing, bag.zh_hk.intervals)).toBe(
      '£19.99 / 月',
    )
  })

  it('says every N months when it charges every few months', () => {
    expect(pricingPerInterval(quarterly, bag.en.intervals)).toBe(
      'every 3 months',
    )
    expect(pricingPriceLine(quarterly, bag.en.intervals)).toBe(
      '£54 every 3 months',
    )
    expect(pricingPriceLine(quarterly, bag.zh_hk.intervals)).toBe(
      '每 3 個月 £54',
    )
  })

  it('pluralises years too', () => {
    const biennial = {
      ...storyPricing,
      priceAmount: 30000,
      priceInterval: 'year',
      priceIntervalCount: 2,
    }
    expect(pricingPriceLine(biennial, bag.en.intervals)).toBe(
      '£300 every 2 years',
    )
    expect(pricingPriceLine(biennial, bag.zh_hk.intervals)).toBe('每 2 年 £300')
  })

  it('treats a missing or odd count as one', () => {
    expect(pricingIntervalCount({ priceIntervalCount: 0 })).toBe(1)
    expect(pricingIntervalCount({ priceIntervalCount: 1 })).toBe(1)
  })
})
