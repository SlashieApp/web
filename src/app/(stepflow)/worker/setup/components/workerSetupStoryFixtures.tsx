import type { Decorator } from '@storybook/nextjs-vite'

import {
  WorkerSetupContext,
  type WorkerSetupContextValue,
} from '../context/WorkerSetupProvider'
import { emptyWorkerSetupFormState } from '../helpers/workerSetupFormState'
import { progressPercent } from '../helpers/workerSetupSteps.config'

/** Static setup context for stories (the real provider queries the API). */
export function workerSetupStoryValue(
  overrides: Partial<WorkerSetupContextValue> = {},
): WorkerSetupContextValue {
  const activeSubStep = overrides.activeSubStep ?? 'profile.bio'
  return {
    bootstrap: {
      id: 'story-user',
      email: 'sam@example.com',
      emailVerified: true,
      phoneVerified: false,
      workerEligibility: true,
      profile: { name: 'Sam Taylor', avatarUrl: null },
      worker: null,
    } as never,
    form: {
      ...emptyWorkerSetupFormState(),
      firstName: 'Sam',
      lastName: 'Taylor',
    },
    activeSubStep,
    completedSubSteps: new Set(['profile.details', 'profile.photo']),
    isHydrated: true,
    loadError: false,
    retryLoad: () => {},
    isSaving: false,
    fieldErrors: {},
    saveError: null,
    expandedMajor: 0,
    progressPercent: progressPercent(activeSubStep),
    workerEligibility: true,
    patchForm: () => {},
    clearSetupErrors: () => {},
    goToSubStep: () => {},
    saveAndContinue: async () => {},
    goBack: () => {},
    toggleMajor: () => {},
    isSubStepUnlocked: (id) =>
      ['profile.details', 'profile.photo', 'profile.bio'].includes(id),
    exitHref: '/tasks/story-task',
    ...overrides,
  }
}

export function withWorkerSetup(
  overrides: Partial<WorkerSetupContextValue> = {},
): Decorator {
  return (Story) => (
    <WorkerSetupContext.Provider value={workerSetupStoryValue(overrides)}>
      <Story />
    </WorkerSetupContext.Provider>
  )
}
