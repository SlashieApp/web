import type { PricingViewConfig } from './types'

/**
 * Signed in, no worker profile (FE-591; Ryan 21 Nov). Slashie Pro is the
 * account's, but customers can't subscribe until their first feature ships:
 * the Pro card says so in place of "Card needed to start", and its green
 * button is Become a worker (back to Pricing after). The Free card has no
 * button, so there is one Become a worker per screen.
 */
export const customer: PricingViewConfig = {
  plans: true,
  current: null,
  paid: 'customerSoon',
  free: null,
  unlimited: {
    kind: 'link',
    label: 'becomeWorker',
    href: '/worker/setup?next=%2Fpricing',
  },
}
