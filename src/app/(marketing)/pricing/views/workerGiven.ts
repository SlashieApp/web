import type { PricingViewConfig } from './types'

/** Slashie Pro given by Slashie with no end: no price and nothing to manage. */
export const workerGiven: PricingViewConfig = {
  plans: true,
  current: 'unlimited',
  paid: 'given',
  free: null,
  unlimited: null,
}
