import type { BillingViewConfig } from './types'

/** Worker setup unfinished: plans start after setup. */
export const workerSetup: BillingViewConfig = {
  title: 'finishSetup',
  body: 'workerSetup',
  date: null,
  badge: null,
  meter: false,
  price: null,
  action: 'finishSetup',
  cancelAnytime: false,
  busy: false,
}
