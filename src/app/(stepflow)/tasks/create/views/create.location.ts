import type { CreateTaskViewConfig } from './types'

/** Full-screen map: the pin and the approximate area workers see. */
export const createLocation: CreateTaskViewConfig = {
  layout: 'step',
  step: 'location',
  map: 'full',
  sections: ['location'],
  fields: ['mapPlaceName', 'locationLat', 'locationLng'],
  primary: 'continue',
}
