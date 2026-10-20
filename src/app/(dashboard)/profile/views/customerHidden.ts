import type { ProfileViewConfig } from './types'

/** No worker profile, profile private: only you can preview the page. */
export const customerHidden: ProfileViewConfig = {
  badge: { label: 'hidden', tone: 'neutral' },
  publicLink: 'preview',
  nextStep: null,
  workerCard: 'empty',
}
