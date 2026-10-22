import type { CreateTaskViewConfig } from './types'

/**
 * Optional photos (FE-355): no fields to check, so Continue works with none.
 * It waits while a HEIC photo converts.
 */
export const createPhotos: CreateTaskViewConfig = {
  layout: 'step',
  step: 'photos',
  map: 'desktopBand',
  sections: ['photos'],
  fields: [],
  primary: 'continue',
}
