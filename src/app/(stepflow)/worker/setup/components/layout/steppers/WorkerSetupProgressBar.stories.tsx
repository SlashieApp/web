import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupProgressBar } from './WorkerSetupProgressBar'

const meta: Meta<typeof WorkerSetupProgressBar> = {
  title: 'stepflow/worker/setup/layout/steppers/WorkerSetupProgressBar',
  component: WorkerSetupProgressBar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
