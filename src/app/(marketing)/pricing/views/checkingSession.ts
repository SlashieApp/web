import type { PricingViewConfig } from './types'

export const checkingSession: PricingViewConfig = {
  plans: true,
  current: null,
  paid: 'trial',
  free: { kind: 'pending' },
  unlimited: { kind: 'pending' },
}
