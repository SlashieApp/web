import type { PricingViewConfig } from './types'

/** Subscription ended (or checkout expired): can subscribe again, no new trial. */
export const workerLapsed: PricingViewConfig = {
  plans: true,
  current: 'free',
  trial: false,
  free: null,
  unlimited: { kind: 'checkout', label: 'resubscribe' },
}
