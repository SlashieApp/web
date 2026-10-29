import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { PRICING_PLANS_HEADING_ID, PricingHeader } from './PricingHeader'

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

/**
 * The plans section's head (an h2: the large "Membership" title is the h1),
 * left-aligned like every section head of the frame: 44/48 at 500 from `lg`,
 * the body in `text-lg` muted, and no eyebrow (it has no string).
 */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const heading = canvas.getByRole('heading', {
      level: 2,
      name: 'Simple plans. Clear quotes.',
    })
    await expect(heading).toBeVisible()
    await expect(heading).toHaveAttribute('id', PRICING_PLANS_HEADING_ID)
    await expect(canvas.queryByRole('heading', { level: 1 })).toBeNull()
    const style = getComputedStyle(heading)
    await expect(style.textAlign).toBe('start')
    await expect(style.fontWeight).toBe('500')
    await expect(style.fontSize).toBe('44px')
    await expect(style.lineHeight).toBe('48px')
    // Left-aligned: the body starts where the heading does, with no eyebrow above it.
    await expect(heading.previousElementSibling).toBeNull()
    await expect(
      canvas.getByText(pricingBag.en.header.body).getBoundingClientRect().left,
    ).toBe(heading.getBoundingClientRect().left)
    await expect(
      getComputedStyle(canvas.getByText(pricingBag.en.header.body)).color,
    ).toBe('rgb(82, 82, 91)')
  },
}

/** Long heading and body: both wrap at the start of the line, inside the 60ch body measure. */
export const LongCopy: Story = {
  args: {
    copy: {
      heading: 'Simple plans for customers, clear quotes for workers',
      body: 'Customers post for free and compare quotes from people nearby. Workers start with free quotes every month, then upgrade whenever they want to quote without a limit.',
    },
  },
}

/** Phone width: the heading drops to 34/41. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', { level: 2 })
    await expect(getComputedStyle(heading).fontSize).toBe('34px')
    await expect(getComputedStyle(heading).lineHeight).toBe('41px')
  },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: { copy: pricingBag.zh_hk.header },
}
