import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupProvider } from '../context/WorkerSetupProvider'
import { WorkerSetupProgressBar } from './WorkerSetupProgressBar'

const meta = {
  title: 'workerSetup/WorkerSetupProgressBar',
  component: WorkerSetupProgressBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <WorkerSetupProvider>
        <Story />
      </WorkerSetupProvider>
    ),
  ],
} satisfies Meta<typeof WorkerSetupProgressBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
