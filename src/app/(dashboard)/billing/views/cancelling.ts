import type { BillingViewConfig } from './types'

/** Cancelled with time left: unlimited until the date, then free. */
export const cancelling: BillingViewConfig = {
  title: 'unlimited',
  body: 'cancelling',
  date: 'periodEnd',
  badge: { label: 'ending', tone: 'warning' },
  meter: false,
  price: null,
  action: 'keepUnlimited',
  cancelAnytime: false,
  busy: false,
}
