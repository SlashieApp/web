import type { BillingViewConfig } from './types'

/** Paying subscriber. */
export const subscribed: BillingViewConfig = {
  title: 'unlimited',
  body: 'subscribed',
  date: 'currentPeriodEnd',
  badge: { label: 'active', tone: 'success' },
  meter: false,
  price: 'price',
  action: 'manageBilling',
  cancelAnytime: false,
  busy: false,
}
