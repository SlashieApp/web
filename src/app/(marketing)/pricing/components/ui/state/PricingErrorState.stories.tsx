import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { PricingErrorState } from './PricingErrorState'

const meta = {
  title: 'Marketing/Pricing/PricingErrorState',
  component: PricingErrorState,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    copy: pricingBag.en.error,
  },
} satisfies Meta<typeof PricingErrorState>

export default meta
type Story = StoryObj<typeof meta>

/** The pricing API failed to load: a calm notice with the payment reminder. */
export const Default: Story = {}

/** Phone width: the notice card fills the screen. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: { copy: pricingBag.zh_hk.error },
}
