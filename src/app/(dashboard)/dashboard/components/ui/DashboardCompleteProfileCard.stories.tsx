import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DashboardCompleteProfileCard } from './DashboardCompleteProfileCard'

const meta: Meta<typeof DashboardCompleteProfileCard> = {
  title: 'dashboard/dashboard/ui/DashboardCompleteProfileCard',
  component: DashboardCompleteProfileCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
