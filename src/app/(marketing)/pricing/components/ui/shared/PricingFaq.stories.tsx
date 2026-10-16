import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { storyPricing } from '../../pricingStoryFixtures'
import { PricingFaq } from './PricingFaq'

const meta = {
  title: 'Marketing/Pricing/PricingFaq',
  component: PricingFaq,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    pricing: storyPricing,
    copy: pricingBag.en.faq,
    intervals: pricingBag.en.intervals,
  },
} satisfies Meta<typeof PricingFaq>

export default meta
type Story = StoryObj<typeof meta>

/** Six questions with the live price, interval and free allowance filled in. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(6)
    await expect(
      canvas.getByText(/continues at £19\.99 \/ month unless/),
    ).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Terms' })).toHaveAttribute(
      'href',
      '/terms',
    )
  },
}

/** The API reports no trial: the trial question is left out. */
export const NoTrial: Story = {
  args: { pricing: { ...storyPricing, trialDays: null, trialLabel: null } },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getAllByRole('heading', { level: 3 }),
    ).toHaveLength(5)
  },
}

/** Yearly price: the trial answer says "/ year". */
export const YearlyPrice: Story = {
  args: {
    pricing: { ...storyPricing, priceAmount: 19900, priceInterval: 'year' },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/£199 \/ year/)).toBeVisible()
  },
}

/** Phone width. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: { copy: pricingBag.zh_hk.faq, intervals: pricingBag.zh_hk.intervals },
}
