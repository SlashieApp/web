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
import { TaskActivitySections } from './TaskActivitySections'

/** Desktop rail card: the lifecycle strip (posted, quotes, booked, done), always open. */
const meta = {
  title: 'Task detail/Overview/TaskActivitySections',
  component: TaskActivitySections,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '380px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskActivitySections>

export default meta
type Story = StoryObj<typeof meta>

const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
})

/** Just posted, no quotes: the strip is waiting on the first one. */
export const Posted: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ quotes: [] }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Waiting for quotes')
  },
}

/** One quote in: it reads "1 quote received". */
export const OneQuote: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ quotes: [storyTaskQuote()] }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('1 quote received')
  },
}

/** Several quotes in: the count and "Compare and accept a worker". */
export const QuotesReceived: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('2 quotes received')
    await canvas.findByText('Compare and accept a worker')
  },
}

/** A worker is booked and the job is under way. */
export const Booked: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: bookedTask,
      order: storyTaskOrder(),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Booked · Jordan Lee')
    await canvas.findByText('Job in progress')
  },
}

/** The job is finished: every step is done and the strip ends on Completed. */
export const Completed: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: bookedTask,
      order: storyTaskOrder({
        status: OrderStatus.Completed,
        closedAt: '2026-06-10T17:00:00.000Z',
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Completed')
  },
}

/** The task was cancelled: the last step reads Cancelled. */
export const Cancelled: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ status: TaskStatus.Cancelled }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Cancelled')
  },
}

/** Seen by a visitor: the same strip, without the owner's booking details. */
export const Visitor: Story = {
  decorators: [withTaskDetailStory({ viewer: 'visitor' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Task posted')
  },
}

/** Task not loaded yet: the card is not rendered. */
export const Loading: Story = {
  decorators: [withTaskDetailPending('loading')],
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByText('Activity')).toBeNull()
  },
}
