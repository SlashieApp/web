import { getWorkerSetupView } from './getWorkerSetupView'
import { setupAbout } from './setup.about'
import { setupArea } from './setup.area'
import { setupComplete } from './setup.complete'
import { setupLoadError } from './setup.loadError'
import { setupLoading } from './setup.loading'
import { setupPhone } from './setup.phone'
import { setupProfile } from './setup.profile'
import { setupReview } from './setup.review'
import { setupSignIn } from './setup.signIn'
import { setupWork } from './setup.work'
import type {
  WorkerSetupScreenId,
  WorkerSetupScreenView,
  WorkerSetupViewConfig,
  WorkerSetupViewName,
} from './types'

export { getWorkerSetupView }
export type {
  WorkerSetupScreenId,
  WorkerSetupScreenView,
  WorkerSetupSection,
  WorkerSetupSubStepId,
  WorkerSetupViewConfig,
  WorkerSetupViewInput,
  WorkerSetupViewName,
} from './types'

export const WORKER_SETUP_VIEWS: Record<
  WorkerSetupViewName,
  WorkerSetupViewConfig
> = {
  'setup.signIn': setupSignIn,
  'setup.loading': setupLoading,
  'setup.loadError': setupLoadError,
  'setup.complete': setupComplete,
  'setup.about': setupAbout,
  'setup.work': setupWork,
  'setup.profile': setupProfile,
  'setup.area': setupArea,
  'setup.phone': setupPhone,
  'setup.review': setupReview,
}

/** Screens in flow order. */
export const WORKER_SETUP_SCREENS = [
  setupAbout,
  setupWork,
  setupProfile,
  setupArea,
  setupPhone,
  setupReview,
] as WorkerSetupScreenView[]

export function workerSetupScreen(
  id: WorkerSetupScreenId,
): WorkerSetupScreenView {
  return WORKER_SETUP_VIEWS[
    getWorkerSetupView({ status: 'ready', screen: id })
  ] as WorkerSetupScreenView
}
