import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { BillingQuoteMeter } from './BillingQuoteMeter'

const meta: Meta<typeof BillingQuoteMeter> = {
  title: 'dashboard/billing/ui/BillingQuoteMeter',
  component: BillingQuoteMeter,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
