import type { WorkerSetupViewConfig } from './types'

/** Profile strength, the profile as customers see it, then Start quoting. */
export const setupReview: WorkerSetupViewConfig = {
  layout: 'screen',
  screen: 'review',
  subSteps: ['review.submit'],
  sections: ['strength', 'preview', 'notes'],
  primary: 'finish',
}
