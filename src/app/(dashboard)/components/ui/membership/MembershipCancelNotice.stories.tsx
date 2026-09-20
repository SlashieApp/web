import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MembershipCancelNotice } from './MembershipCancelNotice'

const meta: Meta<typeof MembershipCancelNotice> = {
  title: 'dashboard/ui/membership/MembershipCancelNotice',
  component: MembershipCancelNotice,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
