import type { CreateTaskViewConfig } from './types'

/** Title, categories, description and optional photos. */
export const createDetails: CreateTaskViewConfig = {
  layout: 'step',
  step: 'details',
  map: 'band',
  sections: ['basics', 'photos'],
  fields: ['title', 'categories', 'description'],
  primary: 'continue',
}
