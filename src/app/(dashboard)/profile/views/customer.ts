import type { ProfileViewConfig } from './types'

/** No worker profile; others can open the profile. */
export const customer: ProfileViewConfig = {
  badge: { label: 'customer', tone: 'neutral' },
  publicLink: true,
  nextStep: null,
  workerCard: 'empty',
}
