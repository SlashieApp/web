import type { PricingViewConfig } from './types'

/** On the free trial: the price, when the trial ends, and Manage billing. */
export const workerTrialing: PricingViewConfig = {
  plans: true,
  current: 'unlimited',
  paid: 'trialing',
  free: null,
  unlimited: { kind: 'link', label: 'manageBilling', href: '/billing' },
}
