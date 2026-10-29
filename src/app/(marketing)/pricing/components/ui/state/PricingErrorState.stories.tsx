import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

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

/**
 * `unavailable`: what's always true, Try again, and Browse tasks. It stands in
 * the plans section under its h2, so its own heading is an h3, and it is
 * left-aligned, not centred.
 */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', {
        level: 3,
        name: pricingBag.en.unavailable.heading,
      }),
    ).toBeVisible()
    // Left-aligned in its column: the card's 2xl measure (672px) has no auto margin.
    const heading = canvas.getByRole('heading', { level: 3 })
    let card: HTMLElement | null = heading
    while (card && getComputedStyle(card).maxWidth !== '672px') {
      card = card.parentElement
    }
    await expect(card).not.toBeNull()
    await expect(getComputedStyle(card as HTMLElement).marginLeft).toBe('0px')
    await expect(
      canvas.getByRole('link', { name: 'Try again' }),
    ).toHaveAttribute('href', '/pricing')
    // Both pills are outline: no second green button next to the header's.
    for (const name of ['Try again', 'Browse tasks']) {
      const style = getComputedStyle(canvas.getByRole('link', { name }))
      await expect(style.backgroundColor).toBe('rgb(255, 255, 255)')
      await expect(style.borderTopColor).toBe('rgb(212, 212, 216)')
    }
  },
}

/** Phone width: the card fills the screen and the buttons wrap. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: { copy: pricingBag.zh_hk.unavailable },
}
