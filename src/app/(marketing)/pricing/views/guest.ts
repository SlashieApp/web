import type { PricingViewConfig } from './types'

/** Signed out: sign up, set up a worker profile, then (for the trial) back here. */
export const guest: PricingViewConfig = {
  plans: true,
  current: null,
  trial: true,
  free: {
    kind: 'link',
    label: 'getStarted',
    href: `/register?next=${encodeURIComponent('/worker/setup')}`,
  },
  unlimited: {
    kind: 'link',
    label: 'startTrial',
    href: `/register?next=${encodeURIComponent('/worker/setup?next=/pricing')}`,
  },
}
