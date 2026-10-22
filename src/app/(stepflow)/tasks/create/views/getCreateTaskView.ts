import type {
  CreateTaskStepId,
  CreateTaskViewInput,
  CreateTaskViewName,
} from './types'

const VIEW_BY_STEP: Record<CreateTaskStepId, CreateTaskViewName> = {
  location: 'create.location',
  address: 'create.address',
  details: 'create.details',
  timing: 'create.timing',
  photos: 'create.photos',
  budget: 'create.budget',
  review: 'create.review',
}

/** The one place that decides what /tasks/create shows. */
export function getCreateTaskView({
  session,
  step,
}: CreateTaskViewInput): CreateTaskViewName {
  if (session === 'guest') return 'create.signIn'
  if (session === 'loading') return 'create.loading'
  if (session === 'error') return 'create.loadError'
  return VIEW_BY_STEP[step]
}
