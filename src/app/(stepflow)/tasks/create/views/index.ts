import { createBudget } from './create.budget'
import { createDetails } from './create.details'
import { createLoadError } from './create.loadError'
import { createLoading } from './create.loading'
import { createLocation } from './create.location'
import { createReview } from './create.review'
import { createSignIn } from './create.signIn'
import { createTiming } from './create.timing'
import type {
  CreateTaskStepId,
  CreateTaskStepView,
  CreateTaskViewConfig,
  CreateTaskViewName,
} from './types'

export { getCreateTaskView } from './getCreateTaskView'
export type {
  CreateTaskSection,
  CreateTaskStepId,
  CreateTaskStepView,
  CreateTaskViewConfig,
  CreateTaskViewInput,
  CreateTaskViewName,
} from './types'

export const CREATE_TASK_VIEWS: Record<
  CreateTaskViewName,
  CreateTaskViewConfig
> = {
  'create.signIn': createSignIn,
  'create.loading': createLoading,
  'create.loadError': createLoadError,
  'create.location': createLocation,
  'create.details': createDetails,
  'create.timing': createTiming,
  'create.budget': createBudget,
  'create.review': createReview,
}

/** Step screens in flow order. */
export const CREATE_TASK_STEPS: readonly CreateTaskStepView[] = [
  createLocation,
  createDetails,
  createTiming,
  createBudget,
  createReview,
] as CreateTaskStepView[]

export function createTaskStep(id: CreateTaskStepId): CreateTaskStepView {
  return CREATE_TASK_STEPS.find(
    (step) => step.step === id,
  ) as CreateTaskStepView
}
