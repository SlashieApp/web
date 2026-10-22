import type { CreateTaskFormFieldValues } from '../createTaskFormSchema'

/** The screens of the create flow, in order (README.md). */
export type CreateTaskStepId =
  | 'location'
  | 'address'
  | 'details'
  | 'timing'
  | 'photos'
  | 'budget'
  | 'review'

export type CreateTaskViewName =
  | 'create.signIn'
  | 'create.loading'
  | 'create.loadError'
  | 'create.location'
  | 'create.address'
  | 'create.details'
  | 'create.timing'
  | 'create.photos'
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
  | 'address'
  | 'basics'
  | 'photos'
  | 'timing'
  | 'budget'
  | 'summary'
  | 'verifyEmail'
  | 'contact'
  | 'consent'

/**
 * Where the map sits: full screen behind a short card (location), the band
 * above the form (address), or the band on desktop only, while phones and
 * tablets give the form the whole screen (details onward, FE-355).
 */
export type CreateTaskMapMode = 'full' | 'band' | 'desktopBand'

export type CreateTaskStepView = {
  layout: 'step'
  step: CreateTaskStepId
  map: CreateTaskMapMode
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
