import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DashboardMembershipPanel } from './DashboardMembershipPanel'

const meta: Meta<typeof DashboardMembershipPanel> = {
  title: 'dashboard/dashboard/ui/DashboardMembershipPanel',
  component: DashboardMembershipPanel,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
