import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingTrialBanner } from './PricingTrialBanner'

const meta: Meta<typeof PricingTrialBanner> = {
  title: 'marketing/pricing/ui/state/PricingTrialBanner',
  component: PricingTrialBanner,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
