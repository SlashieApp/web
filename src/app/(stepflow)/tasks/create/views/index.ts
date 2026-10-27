import { createAddress } from './create.address'
import { createBudget } from './create.budget'
import { createDetails } from './create.details'
import { createLoadError } from './create.loadError'
import { createLoading } from './create.loading'
import { createLocation } from './create.location'
import { createPhotos } from './create.photos'
import { createReview } from './create.review'
import { createSignIn } from './create.signIn'
import { createTiming } from './create.timing'
import { createVerifyEmail } from './create.verifyEmail'
import type {
  CreateTaskStepId,
  CreateTaskStepView,
  CreateTaskViewConfig,
  CreateTaskViewName,
} from './types'

export { getCreateTaskView } from './getCreateTaskView'
export type {
  CreateTaskMapMode,
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
  'create.verifyEmail': createVerifyEmail,
  'create.location': createLocation,
  'create.address': createAddress,
  'create.details': createDetails,
  'create.timing': createTiming,
  'create.photos': createPhotos,
  'create.budget': createBudget,
  'create.review': createReview,
}

/** Step screens in flow order. */
export const CREATE_TASK_STEPS: readonly CreateTaskStepView[] = [
  createLocation,
  createAddress,
  createDetails,
  createTiming,
  createPhotos,
  createBudget,
  createReview,
] as CreateTaskStepView[]

export function createTaskStep(id: CreateTaskStepId): CreateTaskStepView {
  return CREATE_TASK_STEPS.find(
    (step) => step.step === id,
  ) as CreateTaskStepView
}
