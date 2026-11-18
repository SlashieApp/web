import type { PricingViewConfig } from './types'

export const guest: PricingViewConfig = {
  plans: true,
  current: null,
  paid: 'trial',
  // "Become a worker": Free leads into worker setup, so the button says so (FE-290).
  free: {
    kind: 'link',
    label: 'becomeWorker',
    href: `/register?next=${encodeURIComponent('/worker/setup')}`,
  },
  unlimited: {
    kind: 'link',
    label: 'startTrial',
    href: `/register?next=${encodeURIComponent('/worker/setup?next=/pricing')}`,
  },
}
