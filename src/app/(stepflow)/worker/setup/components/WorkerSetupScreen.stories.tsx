import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupScreen } from './WorkerSetupScreen'

const meta: Meta<typeof WorkerSetupScreen> = {
  title: 'stepflow/worker/setup/WorkerSetupScreen',
  component: WorkerSetupScreen,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
