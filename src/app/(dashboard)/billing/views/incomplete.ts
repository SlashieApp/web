import type { BillingViewConfig } from './types'

/** Checkout started but not finished (Stripe incomplete). */
export const incomplete: BillingViewConfig = {
  title: 'unlimited',
  body: 'incomplete',
  date: null,
  badge: { label: 'notFinished', tone: 'warning' },
  meter: false,
  price: null,
  action: 'checkAgain',
  cancelAnytime: false,
  busy: false,
}
