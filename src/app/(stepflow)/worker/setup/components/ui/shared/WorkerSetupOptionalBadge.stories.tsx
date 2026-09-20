import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSetupOptionalBadge } from './WorkerSetupOptionalBadge'

const meta: Meta<typeof WorkerSetupOptionalBadge> = {
  title: 'stepflow/worker/setup/ui/shared/WorkerSetupOptionalBadge',
  component: WorkerSetupOptionalBadge,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
