import type { PricingViewConfig } from './types'

export const workerLapsed: PricingViewConfig = {
  plans: true,
  current: 'free',
  paid: 'price',
  free: null,
  unlimited: { kind: 'checkout', label: 'resubscribe' },
}
