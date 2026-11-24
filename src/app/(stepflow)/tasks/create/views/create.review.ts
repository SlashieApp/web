import type { CreateTaskViewConfig } from './types'

/** What workers will see (each row edits its step). Post task. */
export const createReview: CreateTaskViewConfig = {
  layout: 'step',
  step: 'review',
  map: 'desktopBand',
  sections: ['summary'],
  fields: [],
  primary: 'post',
}
