import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingDisclaimer } from './PricingDisclaimer'

const meta: Meta<typeof PricingDisclaimer> = {
  title: 'Marketing/Pricing/PricingDisclaimer',
  component: PricingDisclaimer,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
