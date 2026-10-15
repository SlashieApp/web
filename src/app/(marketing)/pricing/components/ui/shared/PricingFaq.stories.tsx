import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingFaq } from './PricingFaq'

const meta: Meta<typeof PricingFaq> = {
  title: 'Marketing/Pricing/PricingFaq',
  component: PricingFaq,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
