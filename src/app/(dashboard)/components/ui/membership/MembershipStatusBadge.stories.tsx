import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MembershipStatusBadge } from './MembershipStatusBadge'

const meta: Meta<typeof MembershipStatusBadge> = {
  title: 'dashboard/ui/membership/MembershipStatusBadge',
  component: MembershipStatusBadge,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
