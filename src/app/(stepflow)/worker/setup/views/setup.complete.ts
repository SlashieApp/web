import type { WorkerSetupViewConfig } from './types'

/** Already a worker: they edit on /profile, so send them on. */
export const setupComplete: WorkerSetupViewConfig = {
  layout: 'redirect',
  to: 'exit',
}
