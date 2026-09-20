import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingPlanCards } from './PricingPlanCards'

const meta: Meta<typeof PricingPlanCards> = {
  title: 'marketing/pricing/ui/plan/PricingPlanCards',
  component: PricingPlanCards,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
