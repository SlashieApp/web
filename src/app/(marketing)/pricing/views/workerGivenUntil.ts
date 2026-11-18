import type { PricingViewConfig } from './types'

/**
 * Slashie Pro given by Slashie until a date (BE-117): when it ends, and Keep
 * Slashie Pro, which starts Checkout with the first charge on that date (BE-119).
 */
export const workerGivenUntil: PricingViewConfig = {
  plans: true,
  current: 'unlimited',
  paid: 'ending',
  free: null,
  unlimited: { kind: 'checkout', label: 'keepPro' },
}
