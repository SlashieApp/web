import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { storyMinutesAgo } from '@/app/(auth)/helpers/authStoryFixtures'
import {
  storyQuote,
  storyTask,
} from '@/app/(dashboard)/quotes/components/workerQuoteStoryFixtures'
import type { MyQuoteItem } from '@/utils/dashboardHelpers'

import { DashboardRecentActivity } from './DashboardRecentActivity'

const postedTasks = [
  storyTask({
    id: 'posted-1',
    title: 'Mount bookshelf on living room wall',
    createdAt: storyMinutesAgo(30),
  }),
  storyTask({
    id: 'posted-2',
    title: 'Fix leaking kitchen tap',
    createdAt: storyMinutesAgo(60 * 30),
  }),
]

const quoted = storyTask({
  id: 'quoted-1',
  title: 'Garden tidy-up this weekend',
})
const sentQuotes: MyQuoteItem[] = [
  {
    task: quoted,
    quote: storyQuote({
      id: 'quote-1',
      taskId: quoted.id,
      status: 'PENDING',
      createdAt: storyMinutesAgo(150),
    }),
  },
]

const booked = storyTask({ id: 'quoted-2', title: 'Paint the hallway' })
const acceptedQuotes: MyQuoteItem[] = [
  {
    task: booked,
    quote: storyQuote({
      id: 'quote-2',
      taskId: booked.id,
      status: 'ACCEPTED',
      createdAt: storyMinutesAgo(60 * 5),
    }),
  },
]

const meta = {
  title: 'Dashboard/Home/DashboardRecentActivity',
  component: DashboardRecentActivity,
  parameters: { layout: 'padded' },
  args: { postedTasks, sentQuotes },
} satisfies Meta<typeof DashboardRecentActivity>

export default meta
type Story = StoryObj<typeof meta>

/** Posted tasks and a sent quote, newest first. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findAllByText('Task posted')).toHaveLength(2)
    await expect(canvas.getByText('You sent a quote')).toBeVisible()
  },
}

/** An accepted quote adds a "Quote accepted" row beside "You sent a quote". */
export const QuoteAccepted: Story = {
  args: { postedTasks: [], sentQuotes: acceptedQuotes },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Quote accepted'),
    ).toBeVisible()
  },
}

/** Only tasks posted, no quotes sent. */
export const PostedOnly: Story = {
  args: { sentQuotes: [] },
}

/** Only quotes sent, no tasks posted. */
export const QuotesOnly: Story = {
  args: { postedTasks: [] },
}

/** More than six events: only the six newest show. */
export const ManyEvents: Story = {
  args: {
    postedTasks: Array.from({ length: 8 }, (_, index) =>
      storyTask({
        id: `posted-many-${index}`,
        title: `Task number ${index + 1}`,
        createdAt: storyMinutesAgo(60 * (index + 1)),
      }),
    ),
    sentQuotes: [],
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findAllByText('Task posted'),
    ).toHaveLength(6)
  },
}

/** Nothing yet: an illustration and a Post a task button. */
export const Empty: Story = {
  args: { postedTasks: [], sentQuotes: [] },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', { name: 'Post a task' }),
    ).toBeVisible()
  },
}
