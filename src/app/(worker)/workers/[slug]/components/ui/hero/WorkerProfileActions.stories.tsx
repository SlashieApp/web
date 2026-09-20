import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerProfileActions } from './WorkerProfileActions'

const meta: Meta<typeof WorkerProfileActions> = {
  title: 'worker/workers/ui/hero/WorkerProfileActions',
  component: WorkerProfileActions,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
