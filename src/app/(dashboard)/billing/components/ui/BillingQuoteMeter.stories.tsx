import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { BillingQuoteMeter } from './BillingQuoteMeter'

const meta = {
  title: 'Dashboard/Billing/BillingQuoteMeter',
  component: BillingQuoteMeter,
  parameters: { layout: 'padded' },
  args: { used: 1, total: 3 },
} satisfies Meta<typeof BillingQuoteMeter>

export default meta
type Story = StoryObj<typeof meta>

/** One of three free quotes used, with the reset date. */
export const Partial: Story = {
  args: { resetsOn: '1 Nov 2026' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('1 of 3 used')).toBeVisible()
    await expect(canvas.getByText('Resets on 1 Nov 2026.')).toBeVisible()
  },
}

/** Start of the month: nothing used. */
export const Unused: Story = {
  args: { used: 0 },
}

/** Every free quote used: the bar is full. */
export const LimitReached: Story = {
  args: { used: 3 },
}

/** More used than the allowance (a lowered limit): the bar stops at full. */
export const OverAllowance: Story = {
  args: { used: 5 },
}

/** No allowance at all: the bar stays empty instead of dividing by zero. */
export const NoAllowance: Story = {
  args: { used: 0, total: 0 },
}
