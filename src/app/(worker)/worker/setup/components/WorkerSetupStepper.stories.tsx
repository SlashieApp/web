import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupProvider } from '../context/WorkerSetupProvider'
import { WorkerSetupStepper } from './WorkerSetupStepper'

const meta = {
  title: 'workerSetup/WorkerSetupStepper',
  component: WorkerSetupStepper,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <WorkerSetupProvider>
        <Story />
      </WorkerSetupProvider>
    ),
  ],
} satisfies Meta<typeof WorkerSetupStepper>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
