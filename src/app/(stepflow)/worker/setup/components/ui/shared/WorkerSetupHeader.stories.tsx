import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupHeader } from './WorkerSetupHeader'

const meta: Meta<typeof WorkerSetupHeader> = {
  title: 'stepflow/worker/setup/ui/shared/WorkerSetupHeader',
  component: WorkerSetupHeader,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
