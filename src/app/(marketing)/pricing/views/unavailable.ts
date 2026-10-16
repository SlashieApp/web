import type { PricingViewConfig } from './types'

/** The API didn't return plans: a retry instead of cards, for everyone. */
export const unavailable: PricingViewConfig = {
  plans: false,
  current: null,
  trial: false,
  free: null,
  unlimited: null,
}
