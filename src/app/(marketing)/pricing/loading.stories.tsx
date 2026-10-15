import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import PricingLoading from './loading'

const meta = {
  title: 'Marketing/Pricing/PricingLoading',
  component: PricingLoading,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PricingLoading>

export default meta
type Story = StoryObj<typeof meta>

/** Route loading screen: skeleton header, banner, two plan cards and FAQ rows above the footer. */
export const Default: Story = {}

/** Phone width: the plan card skeletons stack into one column. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
