import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingPlanDetailsLink } from './PricingPlanDetailsLink'

const meta: Meta<typeof PricingPlanDetailsLink> = {
  title: 'marketing/pricing/ui/plan/PricingPlanDetailsLink',
  component: PricingPlanDetailsLink,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
