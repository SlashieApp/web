import { LoginMethod } from '@codegen/schema'
import type { Decorator } from '@storybook/nextjs-vite'
import { type ReactNode, useRef } from 'react'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import { storyImage } from '@/app/(stepflow)/stepflowStoryHelpers'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import {
  WorkerSetupContext,
  type WorkerSetupContextValue,
} from '../context/WorkerSetupProvider'
import {
  type WorkerSetupFormState,
  emptyWorkerSetupFormState,
} from '../helpers/workerSetupFormState'
import { isScreenUnlocked } from '../helpers/workerSetupScreens'
import { validateWorkerSetupScreen } from '../helpers/workerSetupValidation'
import { WORKER_SETUP_SCREENS, type WorkerSetupScreenId } from '../views'

export const STORY_WORKER_AVATAR = storyImage('#7fcfa6', 120)

/** Sub-steps saved by every screen before `screen`. */
export function savedBefore(screen: WorkerSetupScreenId): Set<string> {
  const index = WORKER_SETUP_SCREENS.findIndex((view) => view.screen === screen)
  return new Set(
    WORKER_SETUP_SCREENS.slice(0, index).flatMap((view) => view.subSteps),
  )
}

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

/** The signed-in worker: photo, verified phone and email. */
export type StoryAccount = {
  avatarUrl?: string | null
  phoneVerified?: boolean
  emailVerified?: boolean
}

/** An empty form with a few fields filled in. */
export function workerSetupStoryForm(
  patch: Partial<WorkerSetupFormState> = {},
): WorkerSetupFormState {
  return { ...emptyWorkerSetupFormState(), ...patch }
}

/** The errors a worker would see after pressing Continue on a screen. */
export function workerSetupStoryErrors(
  screen: WorkerSetupScreenId,
  form: Partial<WorkerSetupFormState> = {},
  account: StoryAccount = {},
) {
  return validateWorkerSetupScreen(screen, workerSetupStoryForm(form), account)
}

/** Static setup context for stories (the real provider queries the API). */
export function workerSetupStoryValue(
  overrides: Partial<WorkerSetupContextValue> = {},
  account: StoryAccount = {},
): WorkerSetupContextValue {
  const screen = overrides.screen ?? 'profile'
  const completed = overrides.completed ?? savedBefore(screen)
  return {
    status: 'ready',
    retryLoad: () => {},
    account: {
      avatarUrl: account.avatarUrl ?? null,
      phoneVerified: account.phoneVerified ?? false,
      emailVerified: account.emailVerified ?? true,
    },
    form: workerSetupStoryForm({ firstName: 'Sam', lastName: 'Taylor' }),
    screen,
    completed,
    isSaving: false,
    fieldErrors: {},
    saveError: null,
    patchForm: () => {},
    clearErrors: () => {},
    goToScreen: () => {},
    goBack: () => {},
    saveAndContinue: async () => {},
    isScreenUnlocked: (target) => isScreenUnlocked(target, screen, completed),
    exitHref: '/tasks/story-task',
    headingRef: () => {},
    contentRef: () => {},
    ...overrides,
  }
}

/** The signed-in user that the phone panel and photo upload read from the store. */
export function workerSetupStoryMe(account: StoryAccount = {}): MeSnapshot {
  const phoneVerified = account.phoneVerified ?? false
  return {
    id: 'story-user',
    email: 'sam@example.com',
    emailVerified: account.emailVerified ?? true,
    phoneVerified,
    enabledLoginMethods: [LoginMethod.Password],
    profile: {
      name: 'Sam Taylor',
      contactNumber: phoneVerified ? '+447700900123' : null,
      avatarUrl: account.avatarUrl ?? null,
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

/** Setup context plus the signed-in account; the profile screen by default. */
export function withWorkerSetup(
  overrides: Partial<WorkerSetupContextValue> = {},
  account: StoryAccount = {},
): Decorator {
  return (Story) => (
    <SeedAccount me={workerSetupStoryMe(account)}>
      <WorkerSetupContext.Provider
        value={workerSetupStoryValue(overrides, account)}
      >
        <Story />
      </WorkerSetupContext.Provider>
    </SeedAccount>
  )
}

/** zh-HK: pair with `ZH_HK_SETUP` parameters (the locale comes from the path). */
export const withZhHk: Decorator = (Story) => (
  <LocaleProvider>
    <Story />
  </LocaleProvider>
)

export const ZH_HK_SETUP = {
  nextjs: { navigation: { pathname: '/zh-hk/worker/setup' } },
}
