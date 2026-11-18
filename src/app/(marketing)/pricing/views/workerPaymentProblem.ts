import type { PricingViewConfig } from './types'

/** Past due or unpaid: still their plan, with Billing's line and Fix payment (the portal). */
export const workerPaymentProblem: PricingViewConfig = {
  plans: true,
  current: 'unlimited',
  paid: 'paymentProblem',
  free: null,
  unlimited: { kind: 'portal', label: 'fixPayment' },
}
