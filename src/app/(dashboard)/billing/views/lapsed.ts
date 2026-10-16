import type { BillingViewConfig } from './types'

/** Free again after a subscription: resubscribe, no trial claim. */
export const lapsed: BillingViewConfig = {
  title: 'free',
  body: 'lapsed',
  date: 'canceledAt',
  badge: { label: 'free', tone: 'neutral' },
  meter: true,
  price: 'price',
  action: 'resubscribe',
  cancelAnytime: false,
  busy: false,
}
