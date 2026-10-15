import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingPlanCards } from './PricingPlanCards'

const meta: Meta<typeof PricingPlanCards> = {
  title: 'Marketing/Pricing/PricingPlanCards',
  component: PricingPlanCards,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
