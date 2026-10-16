import type { WorkerSetupViewConfig } from './types'

/** The setup record didn't load: Try again or leave. */
export const setupLoadError: WorkerSetupViewConfig = { layout: 'error' }
