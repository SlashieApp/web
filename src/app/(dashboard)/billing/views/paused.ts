import type { BillingViewConfig } from './types'

/** Subscription paused in Stripe. */
export const paused: BillingViewConfig = {
  title: 'unlimited',
  body: 'paused',
  date: null,
  badge: { label: 'paused', tone: 'warning' },
  meter: false,
  price: null,
  action: 'manageBilling',
  cancelAnytime: false,
  busy: false,
}
