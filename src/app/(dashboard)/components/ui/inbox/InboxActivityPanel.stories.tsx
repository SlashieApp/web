import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { storyMinutesAgo } from '@/app/(auth)/helpers/authStoryFixtures'

import type { ActivityRow } from '../../../helpers/activityRow'
import { InboxActivityPanel } from './InboxActivityPanel'

const rows: ActivityRow[] = [
  {
    id: 'task-posted',
    title: 'Task posted',
    subtitle: 'Mount bookshelf on living room wall',
    happenedAt: storyMinutesAgo(12),
    tone: 'mint',
    href: '/tasks/task-1',
  },
  {
    id: 'quote-sent',
    title: 'You sent a quote',
    subtitle: 'Garden tidy-up this weekend',
    happenedAt: storyMinutesAgo(150),
    tone: 'purple',
    href: '/tasks/task-2',
  },
  {
    id: 'quote-accepted',
    title: 'Quote accepted',
    subtitle: 'Assemble IKEA wardrobe',
    happenedAt: storyMinutesAgo(60 * 26),
    tone: 'blue',
    href: '/tasks/task-3',
  },
]

const meta = {
  title: 'Dashboard/Shared/InboxActivityPanel',
  component: InboxActivityPanel,
  parameters: { layout: 'padded' },
  args: { rows },
} satisfies Meta<typeof InboxActivityPanel>

export default meta
type Story = StoryObj<typeof meta>

/** Recent activity with the default title and description. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Task posted')).toBeVisible()
    await expect(canvas.getAllByRole('link')).toHaveLength(rows.length)
  },
}

/** Caller-supplied heading, description and a View all link. */
export const WithViewAll: Story = {
  args: {
    title: 'Recent activity',
    description: 'Latest updates across your requests, jobs, and quotes.',
    viewAllHref: '/tasks',
  },
}

/** Every dot colour: mint, purple, blue, green and red. */
export const AllTones: Story = {
  args: {
    rows: [
      ...rows,
      {
        id: 'job-completed',
        title: 'Job completed',
        subtitle: 'Paint hallway',
        happenedAt: storyMinutesAgo(60 * 24 * 3),
        tone: 'green',
        href: '/tasks/task-4',
      },
      {
        id: 'task-cancelled',
        title: 'Task cancelled',
        subtitle: 'Move sofa upstairs',
        happenedAt: storyMinutesAgo(60 * 24 * 9),
        tone: 'red',
        href: '/tasks/task-5',
      },
    ],
  },
}

/** Rows without a link are plain text, not links. */
export const UnlinkedRows: Story = {
  args: { rows: rows.map((row) => ({ ...row, href: '' })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Task posted')).toBeVisible()
    await expect(canvas.queryByRole('link')).toBeNull()
  },
}

/** Long titles and subtitles clamp to one line each. */
export const LongText: Story = {
  args: {
    rows: [
      {
        ...rows[0],
        title: 'Task posted and shared with workers across the Watford area',
        subtitle:
          'Mount a very large bookshelf on a living room wall, with fixings supplied, before the weekend',
      },
      rows[1],
    ],
  },
}

/** Loading with nothing to show yet. */
export const Loading: Story = {
  args: { rows: [], loading: true },
}

/** Loading again while rows are already on screen: the rows stay. */
export const RefreshingWithRows: Story = {
  args: { loading: true },
}

/** Nothing yet: a plain message. */
export const Empty: Story = {
  args: { rows: [] },
}

/** Nothing yet, with an illustration and a next step. */
export const EmptyWithAction: Story = {
  args: {
    rows: [],
    emptyMessage:
      'No activity yet. Start by posting a task or sending a quote.',
    emptyActionHref: '/tasks/create',
    emptyActionLabel: 'Post a task',
  },
}
