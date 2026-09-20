import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerMembershipCard } from './WorkerMembershipCard'

const meta: Meta<typeof WorkerMembershipCard> = {
  title: 'dashboard/ui/membership/WorkerMembershipCard',
  component: WorkerMembershipCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
