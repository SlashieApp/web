import type { PricingViewConfig } from './types'

/** Signed in without a worker profile: set one up (the trial needs it). */
export const customer: PricingViewConfig = {
  plans: true,
  current: null,
  trial: true,
  free: { kind: 'link', label: 'becomeWorker', href: '/worker/setup' },
  unlimited: {
    kind: 'link',
    label: 'startTrial',
    href: '/worker/setup?next=%2Fpricing',
  },
}
