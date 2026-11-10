import { describe, expect, it } from 'vitest'

import messages from '@/app/(marketing)/i11n.json'
import type { PricingRecord } from '@/app/(marketing)/pricing/helpers/getPricingForPage'
import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { landingPricing } from './landingPricing'

/** What the live API returns: its trial label is English in every language. */
const live: PricingRecord = {
  productName: 'Slashie Unlimited',
  priceAmount: 1999,
  priceCurrency: 'gbp',
  priceInterval: 'month',
  priceIntervalCount: 1,
  trialDays: 180,
  trialLabel: '6 months free',
  freeQuotesPerMonth: 3,
}

const en = [messages.en.landing.pricingTeaser, pricingBag.en] as const
const zh = [messages.zh_hk.landing.pricingTeaser, pricingBag.zh_hk] as const

describe('landingPricing', () => {
  it('builds the trial line from the trial days, in the page language', () => {
    expect(landingPricing(live, ...zh)).toEqual({
      productName: 'Slashie Unlimited',
      headline: '免費 6 個月',
      subline: '之後 £19.99 / 月 · 無限報價',
      freeHeadline: '每月 3 個報價',
    })
    expect(landingPricing(live, ...en)).toMatchObject({
      headline: '6 months free',
      subline: 'Then £19.99 / month · unlimited quotes',
      freeHeadline: '3 quotes a month',
    })
    // The trial comes from the days, not from the API's label.
    expect(
      landingPricing({ ...live, trialDays: 14, trialLabel: null }, ...zh)
        .headline,
    ).toBe('免費 14 日')
  })

  it('leads with the price when there is no trial', () => {
    expect(
      landingPricing({ ...live, trialDays: null, trialLabel: null }, ...en),
    ).toMatchObject({
      headline: '£19.99 / month',
      subline: 'Unlimited quotes for one subscription',
    })
  })

  it('shows no number without pricing, and says "Unlimited quotes" once', () => {
    for (const [copy, pricingCopy] of [en, zh]) {
      const lines = landingPricing(null, copy, pricingCopy)
      expect(lines.freeHeadline).toBe(copy.freeHeadlineFallback)
      expect(lines.headline).toBe(copy.unlimitedHeadlineFallback)
      const paid = `${lines.headline} ${lines.subline}`
      expect(`${lines.freeHeadline} ${paid}`).not.toMatch(/\d/)
      expect(paid.split(copy.unlimitedHeadlineFallback)).toHaveLength(2)
    }
  })
})
