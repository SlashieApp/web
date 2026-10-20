import type { ProfileViewConfig } from './types'

/** Finished worker, profile private: editable; only you can preview the page. */
export const workerHidden: ProfileViewConfig = {
  badge: { label: 'hidden', tone: 'neutral' },
  publicLink: 'preview',
  nextStep: null,
  workerCard: 'live',
}
