import type { PricingViewConfig } from './types'

/** Paused in Stripe: still their plan, with Billing's line and Manage billing. */
export const workerPaused: PricingViewConfig = {
  plans: true,
  current: 'unlimited',
  paid: 'paused',
  free: null,
  unlimited: { kind: 'link', label: 'manageBilling', href: '/billing' },
}
