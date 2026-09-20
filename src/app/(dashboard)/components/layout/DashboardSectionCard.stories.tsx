import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DashboardSectionCard } from './DashboardSectionCard'

const meta: Meta<typeof DashboardSectionCard> = {
  title: 'dashboard/layout/DashboardSectionCard',
  component: DashboardSectionCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
