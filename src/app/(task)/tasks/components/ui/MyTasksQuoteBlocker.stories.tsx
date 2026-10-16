import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { MyTasksQuoteBlocker } from './MyTasksQuoteBlocker'

const meta = {
  title: 'My tasks/MyTasksQuoteBlocker',
  component: MyTasksQuoteBlocker,
  parameters: { layout: 'padded' },
  args: { blocker: 'quotesUsed' },
} satisfies Meta<typeof MyTasksQuoteBlocker>

export default meta
type Story = StoryObj<typeof meta>

/** Free quotes used this month: See plans. */
export const QuotesUsed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText(/your free quotes for this month are used/),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'See plans' }),
    ).toHaveAttribute('href', '/billing')
  },
}

/** Worker setup unfinished: Finish setup. */
export const FinishSetup: Story = {
  args: { blocker: 'finishSetup' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Finish setup' }),
    ).toHaveAttribute('href', expect.stringContaining('/worker/setup'))
  },
}

/** Last payment failed: Fix payment. */
export const FixPayment: Story = {
  args: { blocker: 'fixPayment' },
}
