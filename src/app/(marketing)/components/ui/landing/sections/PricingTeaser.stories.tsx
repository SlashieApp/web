import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PricingTeaser } from './PricingTeaser'

const meta: Meta<typeof PricingTeaser> = {
  title: 'Marketing/Landing/PricingTeaser',
  component: PricingTeaser,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
