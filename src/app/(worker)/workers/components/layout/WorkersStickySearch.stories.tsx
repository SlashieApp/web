import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkersStickySearch } from './WorkersStickySearch'

const meta: Meta<typeof WorkersStickySearch> = {
  title: 'worker/workers/layout/WorkersStickySearch',
  component: WorkersStickySearch,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
