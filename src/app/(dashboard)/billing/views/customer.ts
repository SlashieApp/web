import type { BillingViewConfig } from './types'

/**
 * No worker profile (FE-591; Ryan 21 Nov): Slashie Pro is the account's, but
 * customers can't subscribe until their first feature ships. Become a worker
 * stays.
 */
export const customer: BillingViewConfig = {
  title: 'unlimited',
  body: 'customer',
  date: null,
  badge: null,
  meter: false,
  price: null,
  action: 'becomeWorker',
  cancelAnytime: false,
  busy: false,
}
