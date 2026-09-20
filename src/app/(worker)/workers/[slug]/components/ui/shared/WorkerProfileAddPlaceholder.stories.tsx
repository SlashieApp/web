import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerProfileAddPlaceholder } from './WorkerProfileAddPlaceholder'

const meta: Meta<typeof WorkerProfileAddPlaceholder> = {
  title: 'worker/workers/ui/shared/WorkerProfileAddPlaceholder',
  component: WorkerProfileAddPlaceholder,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
