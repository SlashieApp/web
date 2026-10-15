import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import { PricingTeaser } from './PricingTeaser'

const copy = messages.en.landing.pricingTeaser
const zhCopy = messages.zh_hk.landing.pricingTeaser

const meta = {
  title: 'Marketing/Landing/PricingTeaser',
  component: PricingTeaser,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    copy,
    pricing: {
      productName: 'Slashie Unlimited',
      headline: '30-day free trial',
      subline: formatMessage(copy.unlimitedSublineWithPrice, {
        priceLine: '£9.99/month',
      }),
      freeHeadline: formatMessage(copy.freeHeadline, { count: 3 }),
    },
    ctaLabel: messages.en.common.ctas.viewPricing,
    pricingHref: '/pricing',
  },
} satisfies Meta<typeof PricingTeaser>

export default meta
type Story = StoryObj<typeof meta>

/** Live pricing with a trial: the premium card leads with the trial label and shows the price after it. */
export const Default: Story = {}

/** Live pricing without a trial: the premium card leads with the price. */
export const PriceOnly: Story = {
  args: {
    pricing: {
      productName: 'Slashie Unlimited',
      headline: '£9.99/month',
      subline: copy.unlimitedSublineFallback,
      freeHeadline: formatMessage(copy.freeHeadline, { count: 3 }),
    },
  },
}

/** Pricing unavailable: both premium lines fall back to generic copy with no price or trial claim. */
export const PricingUnavailable: Story = {
  args: {
    pricing: {
      productName: 'Slashie Unlimited',
      headline: copy.unlimitedHeadlineFallback,
      subline: copy.unlimitedSublineFallback,
      freeHeadline: formatMessage(copy.freeHeadline, { count: 3 }),
    },
  },
}

/** Long trial and price lines: both cards keep equal height and wrap cleanly. */
export const LongText: Story = {
  args: {
    pricing: {
      productName: 'Slashie Unlimited for busy local workers',
      headline: 'Your first three months free, no card needed up front',
      subline: formatMessage(copy.unlimitedSublineWithPrice, {
        priceLine: '£9.99/month, billed monthly, cancel any time',
      }),
      freeHeadline: formatMessage(copy.freeHeadline, { count: 3 }),
    },
  },
}

/** Phone width: the two plan cards stack into one column. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: {
    copy: zhCopy,
    pricing: {
      productName: 'Slashie Unlimited',
      headline: '30 日免費試用',
      subline: formatMessage(zhCopy.unlimitedSublineWithPrice, {
        priceLine: '£9.99/月',
      }),
      freeHeadline: formatMessage(zhCopy.freeHeadline, { count: 3 }),
    },
    ctaLabel: messages.zh_hk.common.ctas.viewPricing,
  },
}
