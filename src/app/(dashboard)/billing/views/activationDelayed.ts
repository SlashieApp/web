import type { BillingViewConfig } from './types'

/** Still not active after the wait: check again. */
export const activationDelayed: BillingViewConfig = {
  title: 'unlimited',
  body: 'activationDelayed',
  date: null,
  badge: { label: 'activating', tone: 'neutral' },
  meter: false,
  price: null,
  action: 'checkAgain',
  cancelAnytime: false,
  busy: false,
}
