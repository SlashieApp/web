import type { PricingViewConfig } from './types'

export const customer: PricingViewConfig = {
  plans: true,
  current: null,
  paid: 'trial',
  free: { kind: 'link', label: 'becomeWorker', href: '/worker/setup' },
  unlimited: {
    kind: 'link',
    label: 'startTrial',
    href: '/worker/setup?next=%2Fpricing',
  },
}
