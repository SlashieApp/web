import type { PricingViewConfig } from './types'

export const unavailable: PricingViewConfig = {
  plans: false,
  current: null,
  paid: 'price',
  free: null,
  unlimited: null,
}
