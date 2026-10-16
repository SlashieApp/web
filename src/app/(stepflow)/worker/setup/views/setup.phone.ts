import type { WorkerSetupViewConfig } from './types'

/** A verified phone: the API won't finish setup without one. */
export const setupPhone: WorkerSetupViewConfig = {
  layout: 'screen',
  screen: 'phone',
  subSteps: ['verify.phone'],
  sections: ['phone'],
  primary: 'continue',
}
