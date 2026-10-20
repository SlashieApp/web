import type { ProfileViewConfig } from './types'

/** Worker setup not finished: the draft stays private, so no public link. */
export const workerSetup: ProfileViewConfig = {
  badge: { label: 'setup', tone: 'warning' },
  publicLink: null,
  nextStep: 'continueSetup',
  workerCard: 'draft',
}
