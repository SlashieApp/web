import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupScreen } from './WorkerSetupScreen'
import {
  ALL_STEPS_BUT_REVIEW,
  STORY_WORKER_AVATAR,
  completedWorkerSetupForm,
  withWorkerSetup,
  workerSetupStoryErrors,
} from './workerSetupStoryFixtures'

const meta: Meta<typeof WorkerSetupScreen> = {
  title: 'Worker setup/WorkerSetupScreen',
  component: WorkerSetupScreen,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Mid-flow on desktop: the headline and bio step beside the side stepper. */
export const Default: Story = { decorators: [withWorkerSetup()] }

/** First step: nothing saved yet, so there is no Back button. */
export const FirstStep: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'profile.details',
      completedSubSteps: new Set(),
    }),
  ],
}

/** Last step: the profile preview and the final "Start quoting" button. */
export const ReviewStep: Story = {
  decorators: [
    withWorkerSetup(
      {
        activeSubStep: 'review.submit',
        completedSubSteps: ALL_STEPS_BUT_REVIEW,
        form: completedWorkerSetupForm,
      },
      { avatarUrl: STORY_WORKER_AVATAR, phoneVerified: true },
    ),
  ],
}

/** Validation errors: Continue was pressed with the headline and bio empty. */
export const FieldErrors: Story = {
  decorators: [
    withWorkerSetup({ fieldErrors: workerSetupStoryErrors('profile.bio') }),
  ],
}

/** Saving: Continue shows its loading state while the step is saved. */
export const Saving: Story = {
  decorators: [withWorkerSetup({ isSaving: true })],
}

/** Save failed: the error shows above the step content. */
export const SaveError: Story = {
  decorators: [
    withWorkerSetup({ saveError: 'Could not save this step. Try again.' }),
  ],
}

/** Phones: the accordion replaces the side stepper. */
export const Mobile: Story = {
  decorators: [withWorkerSetup()],
  globals: { viewport: { value: 'mobile1' } },
}

/** Phones, first step: the first section is open and nothing is complete. */
export const MobileFirstStep: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'profile.details',
      completedSubSteps: new Set(),
    }),
  ],
  globals: { viewport: { value: 'mobile1' } },
}

/** Loading: the branded splash while the setup query is in flight. */
export const Loading: Story = {
  decorators: [withWorkerSetup({ isHydrated: false })],
}

/** The setup query failed: retry instead of a blank screen (FE-207). */
export const LoadError: Story = {
  decorators: [withWorkerSetup({ isHydrated: false, loadError: true })],
}
