import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'

import PricingLoading from './loading'

const meta = {
  title: 'Marketing/Pricing/PricingLoading',
  component: PricingLoading,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PricingLoading>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Route loading screen: the page's frame with its two section rules, the
 * skeleton header, two plan cards and FAQ rows above the footer.
 */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll('[data-section-rule]'),
    ).toHaveLength(2)
    await expect(
      canvasElement.querySelector('[data-marketing-rails]'),
    ).not.toBeNull()
    await expect(canvasElement.querySelectorAll('section')).toHaveLength(2)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Phone width: the plan card skeletons stack into one column. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
