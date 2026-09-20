import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { BillingNonWorkerState } from './BillingNonWorkerState'

const meta: Meta<typeof BillingNonWorkerState> = {
  title: 'dashboard/billing/ui/BillingNonWorkerState',
  component: BillingNonWorkerState,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
