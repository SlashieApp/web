import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import type { PricingRecord } from '../../../helpers/getPricingForPage'
import { PricingFaq } from './PricingFaq'

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
  title: 'Marketing/Pricing/PricingFaq',
  component: PricingFaq,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    pricing,
    copy: pricingBag.en.faq,
  },
} satisfies Meta<typeof PricingFaq>

export default meta
type Story = StoryObj<typeof meta>

/** All five questions; the trial answer shows the live monthly price. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(/continues at £9\.99 per month/),
    ).toBeVisible()
  },
}

/** A short list: two questions under the heading. */
export const TwoQuestions: Story = {
  args: {
    copy: {
      heading: pricingBag.en.faq.heading,
      items: pricingBag.en.faq.items.slice(0, 2),
    },
  },
}

/** Heading only: no questions to show. */
export const NoQuestions: Story = {
  args: {
    copy: { heading: pricingBag.en.faq.heading, items: [] },
  },
}

/** Long questions and answers wrap inside their cards. */
export const LongAnswers: Story = {
  args: {
    copy: {
      heading: pricingBag.en.faq.heading,
      items: [
        {
          question:
            'What exactly happens to my quotes and my worker profile if I decide to stop paying for Slashie Unlimited after the trial ends?',
          answer:
            'Your worker profile, reviews, and history all stay exactly as they are. You go back to the free allowance of quotes each month, and you can upgrade again at {price} per month whenever you like, with no penalty and no setup fee.',
        },
      ],
    },
  },
}

/** Phone width: cards use the tighter padding. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: { copy: pricingBag.zh_hk.faq },
}
