import type { PricingViewConfig } from './types'

/** A paid plan that renews: the price and Manage billing. */
export const workerUnlimited: PricingViewConfig = {
  plans: true,
  current: 'unlimited',
  paid: 'price',
  free: null,
  unlimited: { kind: 'link', label: 'manageBilling', href: '/billing' },
}
