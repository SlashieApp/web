import type { CreateTaskViewConfig } from './types'

/** Title, categories and description. */
export const createDetails: CreateTaskViewConfig = {
  layout: 'step',
  step: 'details',
  map: 'desktopBand',
  sections: ['basics'],
  fields: ['title', 'categories', 'description'],
  primary: 'continue',
}
