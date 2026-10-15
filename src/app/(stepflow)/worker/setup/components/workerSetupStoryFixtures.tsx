import { LoginMethod } from '@codegen/schema'
import type { Decorator } from '@storybook/nextjs-vite'
import { type ReactNode, useRef } from 'react'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import { storyImage } from '@/app/(stepflow)/stepflowStoryHelpers'

import {
  WorkerSetupContext,
  type WorkerSetupContextValue,
} from '../context/WorkerSetupProvider'
import {
  type WorkerSetupFormState,
  emptyWorkerSetupFormState,
} from '../helpers/workerSetupFormState'
import {
  WORKER_SETUP_FLAT_STEPS,
  type WorkerSetupSubStepId,
  isSubStepUnlocked,
  majorIndexForSubStep,
  progressPercent,
} from '../helpers/workerSetupSteps.config'
import { validateWorkerSetupSubStep } from '../helpers/workerSetupValidation'

export const STORY_WORKER_AVATAR = storyImage('#7fcfa6', 120)

/** Every sub-step done except the last, as when a worker reaches Review. */
export const ALL_STEPS_BUT_REVIEW = new Set<string>(
  WORKER_SETUP_FLAT_STEPS.slice(0, -1).map((step) => step.id),
)

/** A finished form: every profile strength signal is done. */
export const completedWorkerSetupForm: WorkerSetupFormState = {
  firstName: 'Sam',
  lastName: 'Taylor',
  dateOfBirth: '1990-04-12',
  tagline: 'Handyman with 8 years experience',
  bio: 'I fit and repair kitchens and bathrooms across North London, with 8 years on the tools. Customers choose me for tidy work, honest quotes and turning up when I say I will.',
  primaryCategory: 'handyman',
  skills: [
    'TV Mounting',
    'Shelving',
    'Furniture Assembly',
    'Door Repairs',
    'Flat-pack',
    'Painting',
  ],
  yearsExperience: '8',
  qualifications: ['City & Guilds', 'NICEIC'],
  locationName: 'Camden, London',
  locationLat: 51.539,
  locationLng: -0.1426,
  travelRadiusMiles: '10',
  portfolioUrls: [storyImage('#9ec5e8', 200), storyImage('#f0c987', 200)],
}

/** The signed-in worker: their photo and whether their phone is verified. */
export type StoryAccount = {
  avatarUrl?: string | null
  phoneVerified?: boolean
}

/**
 * The `me` the setup query returns, cut down to what the setup screens read
 * (hence the cast).
 */
export function workerSetupStoryBootstrap({
  avatarUrl = null,
  phoneVerified = false,
}: StoryAccount = {}) {
  return {
    id: 'story-user',
    email: 'sam@example.com',
    emailVerified: true,
    phoneVerified,
    workerEligibility: true,
    profile: { name: 'Sam Taylor', avatarUrl },
    worker: null,
  } as never
}

/** An empty form with a few fields filled in. */
export function workerSetupStoryForm(
  patch: Partial<WorkerSetupFormState> = {},
): WorkerSetupFormState {
  return { ...emptyWorkerSetupFormState(), ...patch }
}

/** The field errors a worker would see after pressing Continue on a step. */
export function workerSetupStoryErrors(
  subStep: WorkerSetupSubStepId,
  form: Partial<WorkerSetupFormState> = {},
  account: StoryAccount = {},
) {
  return validateWorkerSetupSubStep(
    subStep,
    workerSetupStoryForm(form),
    workerSetupStoryBootstrap(account),
  )
}

/** Static setup context for stories (the real provider queries the API). */
export function workerSetupStoryValue(
  overrides: Partial<WorkerSetupContextValue> = {},
): WorkerSetupContextValue {
  const activeSubStep = overrides.activeSubStep ?? 'profile.bio'
  const completedSubSteps =
    overrides.completedSubSteps ?? new Set(['profile.details', 'profile.photo'])
  return {
    bootstrap: workerSetupStoryBootstrap(),
    form: {
      ...emptyWorkerSetupFormState(),
      firstName: 'Sam',
      lastName: 'Taylor',
    },
    activeSubStep,
    completedSubSteps,
    isHydrated: true,
    loadError: false,
    retryLoad: () => {},
    isSaving: false,
    fieldErrors: {},
    saveError: null,
    expandedMajor: majorIndexForSubStep(activeSubStep),
    progressPercent: progressPercent(activeSubStep),
    workerEligibility: true,
    patchForm: () => {},
    clearSetupErrors: () => {},
    goToSubStep: () => {},
    saveAndContinue: async () => {},
    goBack: () => {},
    toggleMajor: () => {},
    isSubStepUnlocked: (id) =>
      isSubStepUnlocked(id, activeSubStep, completedSubSteps),
    exitHref: '/tasks/story-task',
    ...overrides,
  }
}

/** The signed-in user the verify step and review preview read from the store. */
export function workerSetupStoryMe(phoneVerified = false): MeSnapshot {
  return {
    id: 'story-user',
    email: 'sam@example.com',
    emailVerified: true,
    phoneVerified,
    enabledLoginMethods: [LoginMethod.Password],
    profile: {
      name: 'Sam Taylor',
      contactNumber: phoneVerified ? '+447700900123' : null,
      avatarUrl: null,
    },
  } as MeSnapshot
}

/** Seeds the user store once on mount, before the story first renders. */
function SeedAccount({
  me,
  children,
}: { me: MeSnapshot | null; children: ReactNode }) {
  const seeded = useRef(false)
  if (!seeded.current) {
    seeded.current = true
    useUserStore.setState({
      me,
      user: me ? { id: me.id, email: me.email } : null,
    })
  }
  return children
}

/** Signed in as the story worker, or signed out with `null`. */
export function withWorkerAccount(me: MeSnapshot | null): Decorator {
  return (Story) => (
    <SeedAccount me={me}>
      <Story />
    </SeedAccount>
  )
}

/** Setup context plus the signed-in account, mid-flow on the bio step by default. */
export function withWorkerSetup(
  overrides: Partial<WorkerSetupContextValue> = {},
  account: StoryAccount = {},
): Decorator {
  return (Story) => (
    <SeedAccount me={workerSetupStoryMe(account.phoneVerified)}>
      <WorkerSetupContext.Provider
        value={workerSetupStoryValue({
          bootstrap: workerSetupStoryBootstrap(account),
          ...overrides,
        })}
      >
        <Story />
      </WorkerSetupContext.Provider>
    </SeedAccount>
  )
}
