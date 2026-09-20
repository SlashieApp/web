import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AccountSettingsCard } from './AccountSettingsCard'

const meta: Meta<typeof AccountSettingsCard> = {
  title: 'dashboard/account/ui/AccountSettingsCard',
  component: AccountSettingsCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
