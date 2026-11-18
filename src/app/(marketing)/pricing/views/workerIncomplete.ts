import type { PricingViewConfig } from './types'

/** Checkout didn't finish: Free is still their plan; Check again re-reads it from Stripe. */
export const workerIncomplete: PricingViewConfig = {
  plans: true,
  current: 'free',
  paid: 'notFinished',
  free: null,
  unlimited: { kind: 'sync', label: 'checkAgain' },
}
