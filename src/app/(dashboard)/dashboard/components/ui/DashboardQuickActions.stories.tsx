import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DashboardQuickActions } from './DashboardQuickActions'

const meta: Meta<typeof DashboardQuickActions> = {
  title: 'Dashboard/Home/DashboardQuickActions',
  component: DashboardQuickActions,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
