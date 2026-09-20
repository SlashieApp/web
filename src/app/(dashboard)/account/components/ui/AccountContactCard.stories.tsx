import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AccountContactCard } from './AccountContactCard'

const meta: Meta<typeof AccountContactCard> = {
  title: 'dashboard/account/ui/AccountContactCard',
  component: AccountContactCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
