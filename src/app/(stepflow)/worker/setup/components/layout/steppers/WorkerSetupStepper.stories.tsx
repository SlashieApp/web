import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withWorkerSetup } from '../../workerSetupStoryFixtures'
import { WorkerSetupStepper } from './WorkerSetupStepper'

const meta: Meta<typeof WorkerSetupStepper> = {
  title: 'Worker setup/WorkerSetupStepper',
  component: WorkerSetupStepper,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

/** Mid-flow: two screens done and open, later ones locked. */
export const Default: Story = {
  decorators: [withWorkerSetup()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: /About you/ }),
    ).toBeEnabled()
    await expect(
      canvas.getByRole('button', { name: /Where you work/ }),
    ).toBeDisabled()
  },
}

/** First screen: nothing done, everything after it locked. */
export const FirstStep: Story = {
  decorators: [withWorkerSetup({ screen: 'about', completed: new Set() })],
}

/** The review: every earlier screen done and open to revisit. */
export const ReviewStep: Story = {
  decorators: [withWorkerSetup({ screen: 'review' })],
}
