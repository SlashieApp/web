import type messages from '@/app/(marketing)/i11n.json'
import {
  pricingPriceLine,
  pricingTrialLength,
} from '@/app/(marketing)/pricing/helpers/formatPricing'
import type { PricingRecord } from '@/app/(marketing)/pricing/helpers/getPricingForPage'
import type pricingBag from '@/app/(marketing)/pricing/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import type { LandingPricing } from './PricingTeaser'

type TeaserCopy = (typeof messages)['en']['landing']['pricingTeaser']
type PricingCopy = Pick<(typeof pricingBag)['en'], 'intervals' | 'plans'>

/**
 * The pricing teaser's lines, from live pricing in the page's language. Only
 * what the API backs is claimed:
 *
 * - a trial leads the paid plan, built from the API's `trialDays` with the
 *   pricing page's strings (as `/pricing` builds it), never from its
 *   `trialLabel`, which is English whatever the page's language;
 * - without a trial the price leads;
 * - without pricing (the API reports none, or the fetch failed) no card
 *   carries a number, and "Unlimited quotes" is said once.
 */
export function landingPricing(
  pricing: PricingRecord | null,
  copy: TeaserCopy,
  pricingCopy: PricingCopy,
): LandingPricing {
  if (!pricing) {
    return {
      productName: 'Slashie Unlimited',
      headline: copy.unlimitedHeadlineFallback,
      subline: pricingCopy.plans.unlimited.subtitle,
      freeHeadline: copy.freeHeadlineFallback,
    }
  }
  const priceLine = pricingPriceLine(pricing, pricingCopy.intervals)
  const trial = pricingTrialLength(pricing.trialDays)
  return {
    productName: pricing.productName,
    headline: trial
      ? formatMessage(pricingCopy.plans.trial[trial.unit], {
          count: trial.count,
        })
      : priceLine,
    subline: trial
      ? formatMessage(copy.unlimitedSublineWithPrice, { priceLine })
      : copy.unlimitedSublineFallback,
    freeHeadline: formatMessage(copy.freeHeadline, {
      count: pricing.freeQuotesPerMonth,
    }),
  }
}
