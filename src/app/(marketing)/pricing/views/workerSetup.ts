import type { PricingViewConfig } from './types'

export const workerSetup: PricingViewConfig = {
  plans: true,
  current: 'free',
  paid: 'trial',
  free: null,
  unlimited: {
    kind: 'link',
    label: 'finishSetup',
    href: '/worker/setup?next=%2Fpricing',
  },
}
