import type { CreateTaskViewConfig } from './types'

/**
 * What workers will see (each row edits its step), the email check when it
 * is still unverified, how your worker reaches you, and the allowed-tasks
 * confirmation. Post task.
 */
export const createReview: CreateTaskViewConfig = {
  layout: 'step',
  step: 'review',
  map: 'band',
  sections: ['summary', 'verifyEmail', 'contact', 'consent'],
  fields: ['preferredContactMethod', 'acceptedProhibitedUse'],
  primary: 'post',
}
