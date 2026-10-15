import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  ALL_STEPS_BUT_REVIEW,
  withWorkerSetup,
} from '../../workerSetupStoryFixtures'
import { WorkerSetupStepper } from './WorkerSetupStepper'

const meta: Meta<typeof WorkerSetupStepper> = {
  title: 'Worker setup/WorkerSetupStepper',
  component: WorkerSetupStepper,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Mid-flow: two sub-steps done, the bio active, later steps locked. */
export const Default: Story = { decorators: [withWorkerSetup()] }

/** First step: nothing complete, every later step is locked. */
export const FirstStep: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'profile.details',
      completedSubSteps: new Set(),
    }),
  ],
}

/** Last step: every earlier step is complete and open to revisit. */
export const ReviewStep: Story = {
  decorators: [
    withWorkerSetup({
      activeSubStep: 'review.submit',
      completedSubSteps: ALL_STEPS_BUT_REVIEW,
    }),
  ],
}
