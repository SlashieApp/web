import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingHeader } from './PricingHeader'

const meta: Meta<typeof PricingHeader> = {
  title: 'marketing/pricing/ui/shared/PricingHeader',
  component: PricingHeader,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
