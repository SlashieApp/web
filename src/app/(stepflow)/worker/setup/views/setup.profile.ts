import type { WorkerSetupViewConfig } from './types'

/** Headline (suggested from the trade), bio and optional work photos. */
export const setupProfile: WorkerSetupViewConfig = {
  layout: 'screen',
  screen: 'profile',
  subSteps: ['profile.bio', 'verify.portfolio'],
  sections: ['headline', 'bio', 'portfolio'],
  primary: 'continue',
}
