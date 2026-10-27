import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { PricingHeader } from './PricingHeader'

const meta = {
  title: 'Marketing/Pricing/PricingHeader',
  component: PricingHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    copy: pricingBag.en.header,
  },
} satisfies Meta<typeof PricingHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Centred page heading (an h2: the large "Membership" title is the h1) with one line of supporting copy. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', {
        level: 2,
        name: 'Simple plans. Clear quotes.',
      }),
    ).toBeVisible()
    await expect(canvas.queryByRole('heading', { level: 1 })).toBeNull()
  },
}

/** Long heading and body: both wrap inside the 40rem measure and stay centred. */
export const LongCopy: Story = {
  args: {
    copy: {
      heading: 'Simple plans for customers, clear quotes for workers',
      body: 'Customers post for free and compare quotes from people nearby. Workers start with free quotes every month, then upgrade whenever they want to quote without a limit.',
    },
  },
}

/** Phone width: the heading drops to the smaller size. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: { copy: pricingBag.zh_hk.header },
}
