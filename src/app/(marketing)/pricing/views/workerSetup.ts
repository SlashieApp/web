import type { PricingViewConfig } from './types'

/** Worker profile not finished: finish it before paying (they can't quote yet). */
export const workerSetup: PricingViewConfig = {
  plans: true,
  current: 'free',
  trial: true,
  free: null,
  unlimited: {
    kind: 'link',
    label: 'finishSetup',
    href: '/worker/setup?next=%2Fpricing',
  },
}
