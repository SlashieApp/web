import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PostedTaskQuickStats } from './PostedTaskQuickStats'

const meta: Meta<typeof PostedTaskQuickStats> = {
  title: 'dashboard/requests/ui/PostedTaskQuickStats',
  component: PostedTaskQuickStats,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
