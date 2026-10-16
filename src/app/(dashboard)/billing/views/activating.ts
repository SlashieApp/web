import type { BillingViewConfig } from './types'

/** Back from Checkout, waiting for Stripe: no buttons, so no second Checkout. */
export const activating: BillingViewConfig = {
  title: 'unlimited',
  body: 'activating',
  date: null,
  badge: { label: 'activating', tone: 'neutral' },
  meter: false,
  price: null,
  action: null,
  cancelAnytime: false,
  busy: true,
}
