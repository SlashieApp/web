import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DashboardRecentActivity } from './DashboardRecentActivity'

const meta: Meta<typeof DashboardRecentActivity> = {
  title: 'dashboard/dashboard/ui/DashboardRecentActivity',
  component: DashboardRecentActivity,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
