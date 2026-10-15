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

/** One of three free quotes used. */
export const Partial: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('progressbar', {
        name: '1 of 3 free tasks quoted this month',
      }),
    ).toBeVisible()
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
