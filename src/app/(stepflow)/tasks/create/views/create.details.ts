import type { CreateTaskViewConfig } from './types'

/** Title and categories. The description lives on the details (photos) step. */
export const createDetails: CreateTaskViewConfig = {
  layout: 'step',
  step: 'details',
  map: 'desktopBand',
  sections: ['basics'],
  fields: ['title', 'categories'],
  primary: 'continue',
}
