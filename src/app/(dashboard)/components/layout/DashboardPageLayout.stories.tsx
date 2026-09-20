import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DashboardPageLayout } from './DashboardPageLayout'

const meta: Meta<typeof DashboardPageLayout> = {
  title: 'dashboard/layout/DashboardPageLayout',
  component: DashboardPageLayout,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
