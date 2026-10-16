import type { BillingViewConfig } from './types'

/** On the free trial. */
export const trialing: BillingViewConfig = {
  title: 'unlimited',
  body: 'trialing',
  date: 'trialEndsAt',
  badge: { label: 'trial', tone: 'success' },
  meter: false,
  price: 'thenPrice',
  action: 'manageBilling',
  cancelAnytime: true,
  busy: false,
}
