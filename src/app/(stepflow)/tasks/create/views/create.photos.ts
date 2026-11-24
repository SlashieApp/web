import type { CreateTaskViewConfig } from './types'

/**
 * Details: an optional description, then optional photos (FE-355). Continue
 * works with neither. It waits while a HEIC photo converts.
 */
export const createPhotos: CreateTaskViewConfig = {
  layout: 'step',
  step: 'photos',
  map: 'desktopBand',
  sections: ['photos'],
  fields: ['description'],
  primary: 'continue',
}
