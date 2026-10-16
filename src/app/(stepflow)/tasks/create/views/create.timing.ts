import type { CreateTaskViewConfig } from './types'

/** Flexible, before a date, or a date and time. */
export const createTiming: CreateTaskViewConfig = {
  layout: 'step',
  step: 'timing',
  map: 'band',
  sections: ['timing'],
  fields: ['datetimeType', 'preferredDate', 'preferredTime'],
  primary: 'continue',
}
