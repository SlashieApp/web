import type { CreateTaskViewConfig } from './types'

/** The private exact address, under the map band, after the pin. */
export const createAddress: CreateTaskViewConfig = {
  layout: 'step',
  step: 'address',
  map: 'band',
  sections: ['address'],
  fields: ['streetAddress'],
  primary: 'continue',
}
