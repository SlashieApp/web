import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PostedTaskSummaryBar } from './PostedTaskSummaryBar'

const meta: Meta<typeof PostedTaskSummaryBar> = {
  title: 'dashboard/requests/ui/PostedTaskSummaryBar',
  component: PostedTaskSummaryBar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
