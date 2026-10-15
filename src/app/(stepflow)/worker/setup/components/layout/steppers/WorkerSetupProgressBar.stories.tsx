import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withWorkerSetup } from '../../workerSetupStoryFixtures'
import { WorkerSetupProgressBar } from './WorkerSetupProgressBar'

const meta: Meta<typeof WorkerSetupProgressBar> = {
  title: 'Worker setup/WorkerSetupProgressBar',
  component: WorkerSetupProgressBar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Mid-flow: the headline and bio step. */
export const Default: Story = { decorators: [withWorkerSetup()] }

/** First step: the bar has barely started. */
export const FirstStep: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'profile.details' })],
}

/** Last step: the bar is full. */
export const ReviewStep: Story = {
  decorators: [withWorkerSetup({ activeSubStep: 'review.submit' })],
}
