import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withWorkerSetup } from '../../workerSetupStoryFixtures'
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

export const Default: Story = { decorators: [withWorkerSetup()] }
