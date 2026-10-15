import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import type { PricingRecord } from '../../../helpers/getPricingForPage'
import { PricingTrialBanner } from './PricingTrialBanner'

const pricing: PricingRecord = {
  productName: 'Slashie Unlimited',
  description: 'For active workers',
  priceAmount: 999,
  priceCurrency: 'gbp',
  priceInterval: 'month',
  trialDays: 30,
  trialLabel: 'Free for 30 days',
  freeQuotesPerMonth: 3,
  stripePriceId: 'price_storybook',
  stripeProductId: 'prod_storybook',
}

const meta = {
  title: 'Marketing/Pricing/PricingTrialBanner',
  component: PricingTrialBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    pricing,
    copy: pricingBag.en.trialBanner,
  },
} satisfies Meta<typeof PricingTrialBanner>

export default meta
type Story = StoryObj<typeof meta>

/** The API reports a trial label: the sentence names it and the badge shows it in capitals. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/free for 30 days/)).toBeVisible()
    await expect(canvas.getByText('FREE FOR 30 DAYS')).toBeVisible()
  },
}

/** Trial days but no label: generic sentence and the fallback FREE TRIAL badge. */
export const TrialDaysOnly: Story = {
  args: { pricing: { ...pricing, trialLabel: null } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('FREE TRIAL')).toBeVisible()
  },
}

/** A "trial" label is folded into the sentence without repeating the word. */
export const LabelContainingTrial: Story = {
  args: { pricing: { ...pricing, trialLabel: '30-day free trial' } },
}

/** No trial at all (no label, no days): the banner renders nothing. */
export const NoTrial: Story = {
  args: { pricing: { ...pricing, trialLabel: null, trialDays: null } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg')).toBeNull()
  },
}

/** Phone width: the icon, sentence and badge stack in one column. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: {
    copy: pricingBag.zh_hk.trialBanner,
    pricing: { ...pricing, trialLabel: '免費試用 30 日' },
  },
}
