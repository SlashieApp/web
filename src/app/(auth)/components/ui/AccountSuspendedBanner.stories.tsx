import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AccountSuspendedBanner } from './AccountSuspendedBanner'

const meta: Meta<typeof AccountSuspendedBanner> = {
  title: 'Auth/AccountSuspendedBanner',
  component: AccountSuspendedBanner,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
