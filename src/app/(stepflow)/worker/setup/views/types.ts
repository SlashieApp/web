/** The API's setup sub-steps (`saveWorkerSetupStep`). It takes them in any order. */
export type WorkerSetupSubStepId =
  | 'profile.details'
  | 'profile.photo'
  | 'profile.bio'
  | 'services.skills'
  | 'services.experience'
  | 'area.location'
  | 'area.travel'
  | 'verify.phone'
  | 'verify.portfolio'
  | 'review.submit'

/** The screens of /worker/setup, in order (README.md). */
export type WorkerSetupScreenId =
  | 'about'
  | 'work'
  | 'profile'
  | 'area'
  | 'phone'
  | 'review'

export type WorkerSetupViewName =
  | 'setup.signIn'
  | 'setup.loading'
  | 'setup.loadError'
  | 'setup.complete'
  | 'setup.about'
  | 'setup.work'
  | 'setup.profile'
  | 'setup.area'
  | 'setup.phone'
  | 'setup.review'

export type WorkerSetupViewInput = {
  /** Signed out, loading, failed to load, already a worker, or setting up. */
  status: 'guest' | 'loading' | 'error' | 'complete' | 'ready'
  screen: WorkerSetupScreenId
}

/** Blocks a screen renders, in order. */
export type WorkerSetupSection =
  | 'name'
  | 'dateOfBirth'
  | 'photo'
  | 'trade'
  | 'skills'
  | 'experience'
  | 'qualifications'
  | 'headline'
  | 'bio'
  | 'portfolio'
  | 'area'
  | 'travel'
  | 'phone'
  | 'strength'
  | 'preview'
  | 'notes'

export type WorkerSetupScreenView = {
  layout: 'screen'
  screen: WorkerSetupScreenId
  /** Saved in this order when the worker continues. */
  subSteps: readonly WorkerSetupSubStepId[]
  sections: readonly WorkerSetupSection[]
  primary: 'continue' | 'finish'
}

export type WorkerSetupViewConfig =
  /** `exit`: back to `?next`, else the worker's profile. */
  | { layout: 'redirect'; to: 'login' | 'exit' }
  | { layout: 'splash' }
  | { layout: 'error' }
  | WorkerSetupScreenView
