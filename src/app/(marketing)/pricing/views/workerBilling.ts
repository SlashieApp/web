import type { PricingViewConfig } from './types'

/** Anything else that can't start Checkout: Billing sorts it out. */
export const workerBilling: PricingViewConfig = {
  plans: true,
  current: 'free',
  paid: 'price',
  free: null,
  unlimited: { kind: 'link', label: 'manageBilling', href: '/billing' },
}
