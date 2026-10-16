import type { CreateTaskFormFieldValues } from '../createTaskFormSchema'

/** The screens of the create flow, in order (README.md). */
export type CreateTaskStepId =
  | 'location'
  | 'details'
  | 'timing'
  | 'budget'
  | 'review'

export type CreateTaskViewName =
  | 'create.signIn'
  | 'create.loading'
  | 'create.loadError'
  | 'create.location'
  | 'create.details'
  | 'create.timing'
  | 'create.budget'
  | 'create.review'

export type CreateTaskViewInput = {
  /** No session: log in first. Loading: the account isn't known yet. Error: it failed to load. */
  session: 'guest' | 'loading' | 'error' | 'ready'
  step: CreateTaskStepId
}

/** Blocks a step renders, in order. */
export type CreateTaskSection =
  | 'location'
  | 'basics'
  | 'photos'
  | 'timing'
  | 'budget'
  | 'summary'
  | 'verifyEmail'
  | 'contact'
  | 'consent'

export type CreateTaskStepView = {
  layout: 'step'
  step: CreateTaskStepId
  /** Full-screen map with a bottom card, or the band above the form. */
  map: 'full' | 'band'
  sections: readonly CreateTaskSection[]
  /** Fields checked before leaving the step. */
  fields: readonly (keyof CreateTaskFormFieldValues)[]
  primary: 'continue' | 'post'
}

export type CreateTaskViewConfig =
  | { layout: 'redirect'; to: 'login' }
  | { layout: 'splash' }
  | { layout: 'error' }
  | CreateTaskStepView
