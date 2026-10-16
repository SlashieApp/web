import type { BillingViewConfig } from './types'

/** Free plan while the price loads: no offer until we know it. */
export const loading: BillingViewConfig = {
  title: 'free',
  body: 'free',
  date: null,
  badge: { label: 'free', tone: 'neutral' },
  meter: true,
  price: 'loading',
  action: null,
  cancelAnytime: false,
  busy: false,
}
