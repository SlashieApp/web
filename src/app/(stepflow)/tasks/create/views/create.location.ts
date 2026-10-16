import type { CreateTaskViewConfig } from './types'

/** Full-screen map: the pin, the public area and the private exact address. */
export const createLocation: CreateTaskViewConfig = {
  layout: 'step',
  step: 'location',
  map: 'full',
  sections: ['location'],
  fields: ['mapPlaceName', 'locationLat', 'locationLng', 'streetAddress'],
  primary: 'continue',
}
