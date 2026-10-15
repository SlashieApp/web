import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingUnlimitedCta } from './PricingUnlimitedCta'

const meta: Meta<typeof PricingUnlimitedCta> = {
  title: 'Marketing/Pricing/PricingUnlimitedCta',
  component: PricingUnlimitedCta,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
