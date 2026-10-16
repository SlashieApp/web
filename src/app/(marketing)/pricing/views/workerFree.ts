import type { PricingViewConfig } from './types'

/** Free worker who can still start a trial (`canStartTrial`). */
export const workerFree: PricingViewConfig = {
  plans: true,
  current: 'free',
  trial: true,
  free: null,
  unlimited: { kind: 'checkout', label: 'startTrial' },
}
