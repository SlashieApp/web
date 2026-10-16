import type { WorkerSetupViewConfig } from './types'

/** Signed out: log in, then come back here. */
export const setupSignIn: WorkerSetupViewConfig = {
  layout: 'redirect',
  to: 'login',
}
