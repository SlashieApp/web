import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { DashboardStatTiles } from './DashboardStatTiles'

const meta = {
  title: 'Dashboard/Home/DashboardStatTiles',
  component: DashboardStatTiles,
  parameters: { layout: 'padded' },
  args: {
    loading: false,
    postedCount: 4,
    openPostedCount: 3,
    awaitingQuotesCount: 1,
    quotesSentCount: 7,
    quotesAwaitingResponseCount: 2,
    openOrdersCount: 2,
    pendingEarningsPence: 24000,
    closedOrdersCount: 5,
  },
} satisfies Meta<typeof DashboardStatTiles>

export default meta
type Story = StoryObj<typeof meta>

/** A busy account: posted tasks, sent quotes, open jobs and pending earnings. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('£240')).toBeVisible()
    await expect(canvas.getByText('3 open · 1 awaiting quotes')).toBeVisible()
  },
}

/** Still fetching: every value is an ellipsis and the grid is marked busy. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findAllByText('…')).toHaveLength(4)
  },
}

/** A new account: zero everywhere. */
export const NoActivity: Story = {
  args: {
    postedCount: 0,
    openPostedCount: 0,
    awaitingQuotesCount: 0,
    quotesSentCount: 0,
    quotesAwaitingResponseCount: 0,
    openOrdersCount: 0,
    pendingEarningsPence: 0,
    closedOrdersCount: 0,
  },
}

/** Big numbers still fit their tiles. */
export const HighVolume: Story = {
  args: {
    postedCount: 128,
    openPostedCount: 41,
    awaitingQuotesCount: 12,
    quotesSentCount: 1204,
    quotesAwaitingResponseCount: 87,
    openOrdersCount: 36,
    pendingEarningsPence: 1245000,
    closedOrdersCount: 940,
  },
}

/** Phones: two tiles per row. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
