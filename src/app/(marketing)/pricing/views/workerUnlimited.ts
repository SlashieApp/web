import type { PricingViewConfig } from './types'

/** Has unlimited quotes (trial, active, or cancelling with time left). */
export const workerUnlimited: PricingViewConfig = {
  plans: true,
  current: 'unlimited',
  trial: false,
  free: null,
  unlimited: { kind: 'link', label: 'manageBilling', href: '/billing' },
}
