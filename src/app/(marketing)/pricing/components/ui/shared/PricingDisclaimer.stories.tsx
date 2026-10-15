import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { PricingDisclaimer } from './PricingDisclaimer'

const meta = {
  title: 'Marketing/Pricing/PricingDisclaimer',
  component: PricingDisclaimer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    copy: pricingBag.en.disclaimer,
    termsHref: '/terms',
  },
} satisfies Meta<typeof PricingDisclaimer>

export default meta
type Story = StoryObj<typeof meta>

/** Shield icon, the payment disclaimer, and an inline link to the terms. */
export const Default: Story = {}

/** Long disclaimer text wraps beside the icon without pushing it out of line. */
export const LongCopy: Story = {
  args: {
    copy: {
      body: 'Job payments are arranged directly between customers and workers, outside Slashie, and Slashie never holds or releases that money. The Slashie subscription is for platform access only and is billed separately by our payment provider.',
      terms: 'Read the full terms.',
    },
  },
}

/** Phone width: tighter padding, text fills the card. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy, with the terms link in the zh-hk locale. */
export const TraditionalChinese: Story = {
  args: { copy: pricingBag.zh_hk.disclaimer, termsHref: '/zh-hk/terms' },
}
