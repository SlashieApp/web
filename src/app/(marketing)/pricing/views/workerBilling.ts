import type { PricingViewConfig } from './types'

/** Subscription stuck (payment failed, paused, checkout unfinished): Billing sorts it. */
export const workerBilling: PricingViewConfig = {
  plans: true,
  current: 'free',
  trial: false,
  free: null,
  unlimited: { kind: 'link', label: 'manageBilling', href: '/billing' },
}
