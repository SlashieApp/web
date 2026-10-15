import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingErrorState } from './PricingErrorState'

const meta: Meta<typeof PricingErrorState> = {
  title: 'Marketing/Pricing/PricingErrorState',
  component: PricingErrorState,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
