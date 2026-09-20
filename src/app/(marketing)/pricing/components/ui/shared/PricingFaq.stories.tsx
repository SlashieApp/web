import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingFaq } from './PricingFaq'

const meta: Meta<typeof PricingFaq> = {
  title: 'marketing/pricing/ui/shared/PricingFaq',
  component: PricingFaq,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
