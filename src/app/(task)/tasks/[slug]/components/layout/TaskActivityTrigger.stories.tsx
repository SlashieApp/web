import { OrderStatus, QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import {
  storyOwnerTimeline,
  storyPublicQuote,
  storyPublicTimeline,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskActivityTrigger } from './TaskActivityTrigger'

/**
 * Phones only: the Overview card that opens the Activity log in a bottom
 * sheet, with the latest line as its summary.
 */
const meta = {
  title: 'Task detail/Layout/TaskActivityTrigger',
  component: TaskActivityTrigger,
  parameters: { layout: 'padded' },
  globals: { viewport: { value: 'mobile1' } },
} satisfies Meta<typeof TaskActivityTrigger>

export default meta
type Story = StoryObj<typeof meta>

const finishedJob = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
  timeline: storyOwnerTimeline(),
})

/** The sheet the card opens (it portals to the page). */
const sheet = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** The owner of a finished job: the summary is the latest line. */
export const Owner: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: finishedJob,
      order: storyTaskOrder({
        status: OrderStatus.Completed,
        closedAt: '2026-06-10T19:10:00.000Z',
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const card = await within(canvasElement).findByRole('button', {
      name: /Activity/,
    })
    await expect(card).toHaveTextContent('You left a review')
  },
}

/** Signed out, task open: the latest unnamed quote line. */
export const Visitor: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({
        quotes: [storyPublicQuote()],
        timeline: storyPublicTimeline(),
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const card = await within(canvasElement).findByRole('button', {
      name: /Activity/,
    })
    await expect(card).toHaveTextContent('A worker withdrew their quote')
  },
}

/** Nothing recorded yet: the summary says so. */
export const Empty: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({ timeline: [] }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const card = await within(canvasElement).findByRole('button', {
      name: /Activity/,
    })
    await expect(card).toHaveTextContent(
      'Nothing has happened on this task yet.',
    )
  },
}

/** The viewer's history is still loading: no summary yet, placeholders in the sheet. */
export const HistoryLoading: Story = {
  decorators: [withTaskDetailPending('viewerLoading')],
  play: async ({ canvasElement }) => {
    const card = await within(canvasElement).findByRole('button', {
      name: /Activity/,
    })
    await expect(card).toHaveTextContent(/^Activity$/)
    await userEvent.click(card)
    const dialog = await sheet(canvasElement).findByRole('dialog')
    await waitFor(() =>
      expect(dialog.querySelector('[aria-busy]')).not.toBeNull(),
    )
  },
}

/** The task itself hasn't loaded: no card yet. */
export const TaskLoading: Story = {
  decorators: [withTaskDetailPending('loading')],
  play: async ({ canvasElement }) => {
    expect(
      within(canvasElement).queryByRole('button', { name: /Activity/ }),
    ).toBeNull()
  },
}

/** Tapping the card opens the sheet with every line, oldest first. */
export const SheetOpen: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: finishedJob,
      order: storyTaskOrder({
        status: OrderStatus.Completed,
        closedAt: '2026-06-10T19:10:00.000Z',
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: /Activity/ }),
    )
    const dialog = within(await sheet(canvasElement).findByRole('dialog'))
    const items = await dialog.findAllByRole('listitem')
    await expect(items).toHaveLength(12)
    await expect(items[0]).toHaveTextContent('You posted the task')
    await expect(items.at(-1)).toHaveTextContent('You left a review')
  },
}
