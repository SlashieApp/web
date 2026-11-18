import type { PricingViewConfig } from './types'

export const workerFree: PricingViewConfig = {
  plans: true,
  current: 'free',
  paid: 'trial',
  free: null,
  unlimited: { kind: 'checkout', label: 'startTrial' },
}
