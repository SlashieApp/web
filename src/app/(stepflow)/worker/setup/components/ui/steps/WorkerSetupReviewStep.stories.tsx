import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  ALL_STEPS_BUT_REVIEW,
  STORY_WORKER_AVATAR,
  completedWorkerSetupForm,
  withWorkerSetup,
  workerSetupStoryForm,
} from '../../workerSetupStoryFixtures'
import { WorkerSetupReviewStep } from './WorkerSetupReviewStep'

const meta: Meta<typeof WorkerSetupReviewStep> = {
  title: 'Worker setup/WorkerSetupReviewStep',
  component: WorkerSetupReviewStep,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const review = {
  activeSubStep: 'review.submit',
  completedSubSteps: ALL_STEPS_BUT_REVIEW,
} as const

/** Starter tier: only the name is filled, so every other signal is a fix link. */
export const Starter: Story = {
  decorators: [
    withWorkerSetup({
      ...review,
      form: workerSetupStoryForm({ firstName: 'Sam', lastName: 'Taylor' }),
    }),
  ],
}

/** Good tier: photo, headline, skills and area done; bio, phone and photos missing. */
export const Good: Story = {
  decorators: [
    withWorkerSetup(
      {
        ...review,
        form: { ...completedWorkerSetupForm, bio: '', portfolioUrls: [] },
      },
      { avatarUrl: STORY_WORKER_AVATAR },
    ),
  ],
}

/** All-star tier with one gap: everything but the work photos is done. */
export const AllStarOneMissing: Story = {
  decorators: [
    withWorkerSetup(
      {
        ...review,
        form: { ...completedWorkerSetupForm, portfolioUrls: [] },
      },
      { avatarUrl: STORY_WORKER_AVATAR, phoneVerified: true },
    ),
  ],
}

/** All-star tier: every signal done, so there are no fix links. */
export const AllStar: Story = {
  decorators: [
    withWorkerSetup(
      {
        ...review,
        form: completedWorkerSetupForm,
      },
      { avatarUrl: STORY_WORKER_AVATAR, phoneVerified: true },
    ),
  ],
}

/** The account does not meet every requirement yet: the closing note says so. */
export const NotEligible: Story = {
  decorators: [
    withWorkerSetup({
      ...review,
      form: completedWorkerSetupForm,
      workerEligibility: false,
    }),
  ],
}
