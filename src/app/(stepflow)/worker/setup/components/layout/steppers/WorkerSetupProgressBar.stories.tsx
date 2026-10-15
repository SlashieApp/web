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

export const Default: Story = { decorators: [withWorkerSetup()] }
