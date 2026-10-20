import type { ProfileViewConfig } from './types'

/** Finished, verified and public: nothing pending (to-dos sit in the card). */
export const workerReady: ProfileViewConfig = {
  badge: { label: 'active', tone: 'success' },
  publicLink: 'view',
  nextStep: null,
  workerCard: 'live',
}
