import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingDisclaimer } from './PricingDisclaimer'

const meta: Meta<typeof PricingDisclaimer> = {
  title: 'marketing/pricing/ui/shared/PricingDisclaimer',
  component: PricingDisclaimer,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
