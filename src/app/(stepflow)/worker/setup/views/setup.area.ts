import type { WorkerSetupViewConfig } from './types'

/** Town or postcode, with an approximate map, and an optional travel distance. */
export const setupArea: WorkerSetupViewConfig = {
  layout: 'screen',
  screen: 'area',
  subSteps: ['area.location', 'area.travel'],
  sections: ['area', 'travel'],
  primary: 'continue',
}
