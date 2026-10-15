import { OrderStatus, QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import {
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskTitle } from './TaskTitle'

/**
 * Sticky title: back control (phones), title and the phones' Help & actions
 * menu. Chips scroll away under it; the status badge lives on the Task summary.
 */
const meta = {
  title: 'Task detail/Layout/TaskTitle',
  component: TaskTitle,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TaskTitle>

export default meta
type Story = StoryObj<typeof meta>

const TITLE = 'Mount bookshelf on living room wall'
const LONG_TITLE =
  'Mount a floating bookshelf, three picture rails and a TV bracket across the living room and hallway before the weekend'

/** Owner of an open task. */
export const Default: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1, name: TITLE })
  },
}

/** Docked: compact one-line title once the chrome sticks. */
export const Stuck: Story = {
  args: { isStuck: true },
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
}

/** A long title wraps over several lines. */
export const LongTitle: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ title: LONG_TITLE }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      level: 1,
      name: LONG_TITLE,
    })
  },
}

/** A long title once docked: one line, cut off with an ellipsis. */
export const LongTitleStuck: Story = {
  args: { isStuck: true },
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ title: LONG_TITLE }),
    }),
  ],
}

/** Phone: the back button on the left and the options menu on the right. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withTaskDetailStory({ viewer: 'visitor' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Go back' })
    await canvas.findByRole('button', { name: 'Task options' })
  },
}

/** Phones: the menu adds the booking actions (Reschedule, Cancel booking). */
export const PhoneMenuBooked: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: storyTaskDetail({
        status: TaskStatus.Awarded,
        quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
      }),
      order: storyTaskOrder({
        status: OrderStatus.Active,
        bookedStart: '2030-06-10T14:00:00.000Z',
        bookedEnd: '2030-06-10T16:00:00.000Z',
      }),
    }),
  ],
}

/** Direct load: a skeleton bar stands in for the title. */
export const Loading: Story = {
  decorators: [withTaskDetailPending('loading')],
}

/** Opened from a search card: the card's title shows while the rest loads. */
export const LoadingFromSearchCard: Story = {
  decorators: [withTaskDetailPending('listingSeed')],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1, name: TITLE })
    expect(canvasElement).toBeVisible()
  },
}
