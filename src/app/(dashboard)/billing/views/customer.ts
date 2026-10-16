import type { BillingViewConfig } from './types'

/** No worker profile: plans are for workers. */
export const customer: BillingViewConfig = {
  title: 'workersOnly',
  body: 'customer',
  date: null,
  badge: null,
  meter: false,
  price: null,
  action: 'becomeWorker',
  cancelAnytime: false,
  busy: false,
}
