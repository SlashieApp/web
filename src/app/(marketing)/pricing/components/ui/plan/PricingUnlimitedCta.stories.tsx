import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingUnlimitedCta } from './PricingUnlimitedCta'

const meta: Meta<typeof PricingUnlimitedCta> = {
  title: 'marketing/pricing/ui/plan/PricingUnlimitedCta',
  component: PricingUnlimitedCta,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
