import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DashboardPageHeader } from './DashboardPageHeader'

const meta: Meta<typeof DashboardPageHeader> = {
  title: 'dashboard/layout/DashboardPageHeader',
  component: DashboardPageHeader,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
