import type { PricingViewConfig } from './types'

/** Session cookie, profile still loading: placeholders, so no wrong button flashes. */
export const checkingSession: PricingViewConfig = {
  plans: true,
  current: null,
  trial: true,
  free: { kind: 'pending' },
  unlimited: { kind: 'pending' },
}
