import type { ProfileViewConfig } from './types'

/** No worker profile, profile private: there's no public page to link to. */
export const customerHidden: ProfileViewConfig = {
  badge: { label: 'hidden', tone: 'neutral' },
  publicLink: false,
  nextStep: null,
  workerCard: 'empty',
}
