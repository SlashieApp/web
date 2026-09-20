import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DashboardSectionNav } from './DashboardSectionNav'

const meta: Meta<typeof DashboardSectionNav> = {
  title: 'dashboard/layout/DashboardSectionNav',
  component: DashboardSectionNav,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
