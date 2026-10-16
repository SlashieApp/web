import type {
  WorkerSetupScreenId,
  WorkerSetupViewInput,
  WorkerSetupViewName,
} from './types'

const VIEW_BY_SCREEN: Record<WorkerSetupScreenId, WorkerSetupViewName> = {
  about: 'setup.about',
  work: 'setup.work',
  profile: 'setup.profile',
  area: 'setup.area',
  phone: 'setup.phone',
  review: 'setup.review',
}

/** The one place that decides what /worker/setup shows. */
export function getWorkerSetupView({
  status,
  screen,
}: WorkerSetupViewInput): WorkerSetupViewName {
  if (status === 'guest') return 'setup.signIn'
  if (status === 'loading') return 'setup.loading'
  if (status === 'error') return 'setup.loadError'
  if (status === 'complete') return 'setup.complete'
  return VIEW_BY_SCREEN[screen]
}
