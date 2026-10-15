import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { PricingPlanDetailsLink } from './PricingPlanDetailsLink'

const meta = {
  title: 'Marketing/Pricing/PricingPlanDetailsLink',
  component: PricingPlanDetailsLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    label: pricingBag.en.detailsLink,
  },
} satisfies Meta<typeof PricingPlanDetailsLink>

export default meta
type Story = StoryObj<typeof meta>

/** Centred link that jumps to the plan details section (the FAQ). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: /See all plan details/ }),
    ).toHaveAttribute('href', '#plan-details')
  },
}

/** Traditional Chinese label. */
export const TraditionalChinese: Story = {
  args: { label: pricingBag.zh_hk.detailsLink },
}
