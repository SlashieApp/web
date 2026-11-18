import type { PricingViewConfig } from './types'

/** A paid plan that won't renew: when it ends, and Keep Slashie Pro (the portal, as Billing). */
export const workerCancelling: PricingViewConfig = {
  plans: true,
  current: 'unlimited',
  paid: 'ending',
  free: null,
  unlimited: { kind: 'portal', label: 'keepPro' },
}
