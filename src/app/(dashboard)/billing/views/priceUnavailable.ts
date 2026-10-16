import type { BillingViewConfig } from './types'

/** Free plan, but the price didn't load: retry instead of an offer. */
export const priceUnavailable: BillingViewConfig = {
  title: 'free',
  body: 'priceUnavailable',
  date: null,
  badge: { label: 'free', tone: 'neutral' },
  meter: true,
  price: null,
  action: 'retryPricing',
  cancelAnytime: false,
  busy: false,
}
