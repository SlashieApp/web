import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MembershipStatusDetail } from './MembershipStatusDetail'

const meta: Meta<typeof MembershipStatusDetail> = {
  title: 'dashboard/ui/membership/MembershipStatusDetail',
  component: MembershipStatusDetail,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
