import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { PricingErrorState } from './PricingErrorState'

const meta = {
  title: 'Marketing/Pricing/PricingErrorState',
  component: PricingErrorState,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { copy: pricingBag.en.unavailable },
} satisfies Meta<typeof PricingErrorState>

export default meta
type Story = StoryObj<typeof meta>

/** `unavailable`: what's always true, Try again, and Browse tasks. */
export const Default: Story = {}

/** Phone width: the card fills the screen and the buttons wrap. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: { copy: pricingBag.zh_hk.unavailable },
}
