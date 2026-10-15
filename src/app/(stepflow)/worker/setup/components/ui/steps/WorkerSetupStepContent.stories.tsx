import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withWorkerSetup } from '../../workerSetupStoryFixtures'
import { WorkerSetupStepContent } from './WorkerSetupStepContent'

const meta: Meta<typeof WorkerSetupStepContent> = {
  title: 'Worker setup/WorkerSetupStepContent',
  component: WorkerSetupStepContent,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { decorators: [withWorkerSetup()] }
