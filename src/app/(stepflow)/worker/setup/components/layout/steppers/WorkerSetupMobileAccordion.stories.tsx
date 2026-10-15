import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  ALL_STEPS_BUT_REVIEW,
  completedWorkerSetupForm,
  withWorkerSetup,
} from '../../workerSetupStoryFixtures'
import { WorkerSetupMobileAccordion } from './WorkerSetupMobileAccordion'

const meta: Meta<typeof WorkerSetupMobileAccordion> = {
  title: 'Worker setup/WorkerSetupMobileAccordion',
  component: WorkerSetupMobileAccordion,
  parameters: {
    layout: 'padded',
  },
  globals: { viewport: { value: 'mobile1' } },
}

export default meta
type Story = StoryObj<typeof meta>

/** Mid-flow: the active section is open, with its step content below. */
export const Default: Story = { decorators: [withWorkerSetup()] }

/** First step: nothing complete yet, only the current sub-step is open to tap. */
export const FirstStep: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'profile.details',
      completedSubSteps: new Set(),
    }),
  ],
}

/** Every section collapsed: just the five headers. */
export const AllCollapsed: Story = {
  decorators: [withWorkerSetup({ expandedMajor: null })],
}

/** A finished section shows a tick, and the next section is the active one. */
export const LaterSection: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'services.skills',
      completedSubSteps: new Set([
        'profile.details',
        'profile.photo',
        'profile.bio',
      ]),
    }),
  ],
}

/** A later section opened early: its sub-steps are disabled until reached. */
export const LockedSubSteps: Story = {
  decorators: [withWorkerSetup({ expandedMajor: 2 })],
}

/** A save failed: the error sits above the step content. */
export const SaveError: Story = {
  decorators: [
    withWorkerSetup({ saveError: 'Could not save this step. Try again.' }),
  ],
}

/** Last step: everything before it is complete and the review is open. */
export const ReviewStep: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'review.submit',
      completedSubSteps: ALL_STEPS_BUT_REVIEW,
      form: completedWorkerSetupForm,
    }),
  ],
}
