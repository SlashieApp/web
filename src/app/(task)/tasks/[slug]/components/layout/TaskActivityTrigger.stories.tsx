import { OrderStatus, QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { userEvent, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskActivityTrigger } from './TaskActivityTrigger'

/** Phones only: the Overview card that opens the lifecycle in a bottom sheet. */
const meta = {
  title: 'Task detail/Layout/TaskActivityTrigger',
  component: TaskActivityTrigger,
  parameters: { layout: 'padded' },
  globals: { viewport: { value: 'mobile1' } },
} satisfies Meta<typeof TaskActivityTrigger>

export default meta
type Story = StoryObj<typeof meta>

const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
})

/** Task just posted, no quotes yet: the summary line is the first step. */
export const Posted: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ quotes: [] }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Task posted')
  },
}

/** Quotes are in: the line counts them. */
export const QuotesReceived: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('2 quotes received')
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
    await within(canvasElement).findByText('Booked · Jordan Lee')
  },
}

/** Job finished: the last step reads Completed. */
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

/** Task cancelled: the last step reads Cancelled. */
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

/** Tapping the card opens the sheet with every step. */
export const SheetOpen: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /Activity/ }),
    )
    const sheet = within(canvasElement.ownerDocument.body)
    await sheet.findByRole('dialog')
    await sheet.findByText('Task posted')
  },
}
