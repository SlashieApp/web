import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupStepper } from './WorkerSetupStepper'

const meta: Meta<typeof WorkerSetupStepper> = {
  title: 'stepflow/worker/setup/layout/steppers/WorkerSetupStepper',
  component: WorkerSetupStepper,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
