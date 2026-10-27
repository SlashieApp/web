import type { CreateTaskViewConfig } from './types'

/**
 * What workers will see (each row edits its step), how your worker reaches
 * you, and the allowed-tasks confirmation. Post task.
 */
export const createReview: CreateTaskViewConfig = {
  layout: 'step',
  step: 'review',
  map: 'desktopBand',
  sections: ['summary', 'contact', 'consent'],
  fields: ['preferredContactMethod', 'acceptedProhibitedUse'],
  primary: 'post',
}
