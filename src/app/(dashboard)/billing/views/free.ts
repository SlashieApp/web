import type { BillingViewConfig } from './types'

/** Free plan with a trial on offer. */
export const free: BillingViewConfig = {
  title: 'free',
  body: 'free',
  date: null,
  badge: { label: 'free', tone: 'neutral' },
  meter: true,
  price: 'trialThenPrice',
  action: 'startTrial',
  cancelAnytime: false,
  busy: false,
}
