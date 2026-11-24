import type { CreateTaskViewConfig } from './types'

/** The private exact address, under the map band, after the pin. */
export const createAddress: CreateTaskViewConfig = {
  layout: 'step',
  step: 'address',
  map: 'band',
  sections: ['address'],
  fields: ['addressLine1', 'addressLine2', 'city', 'county', 'postcode'],
  primary: 'continue',
}
