import type { BillingViewConfig } from './types'

/** Past due or unpaid: quoting is blocked until payment is fixed. */
export const paymentProblem: BillingViewConfig = {
  title: 'unlimited',
  body: 'paymentProblem',
  date: null,
  badge: { label: 'paymentProblem', tone: 'danger' },
  meter: false,
  price: null,
  action: 'fixPayment',
  cancelAnytime: false,
  busy: false,
}
