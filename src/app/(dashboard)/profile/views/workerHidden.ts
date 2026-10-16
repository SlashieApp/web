import type { ProfileViewConfig } from './types'

/** Finished worker, profile private: editable, but no public page to link to. */
export const workerHidden: ProfileViewConfig = {
  badge: { label: 'hidden', tone: 'neutral' },
  publicLink: false,
  nextStep: null,
  workerCard: 'live',
}
