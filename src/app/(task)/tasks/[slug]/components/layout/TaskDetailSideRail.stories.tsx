import { OrderStatus, QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskDetailSideRail } from './TaskDetailSideRail'

/** Desktop rail: Help & actions, the owner's Analytics, then Activity. */
const meta = {
  title: 'Task detail/Layout/TaskDetailSideRail',
  component: TaskDetailSideRail,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '380px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskDetailSideRail>

export default meta
type Story = StoryObj<typeof meta>

const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
})

/** Owner of an open task: all three cards, with Edit and Cancel task. */
export const OwnerOpenTask: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Analytics')
    await canvas.findByRole('link', { name: /Edit task/ })
  },
}

/** A visitor: Help & actions with Report task and Activity, no Analytics. */
export const Visitor: Story = {
  decorators: [withTaskDetailStory({ viewer: 'visitor' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: /Report task/ })
    expect(canvas.queryByText('Analytics')).toBeNull()
  },
}

/** Booked worker before the start: Reschedule and Cancel booking come first. */
export const BookedWorker: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: bookedTask,
      order: storyTaskOrder({
        bookedStart: '2030-06-10T09:00:00.000Z',
        bookedEnd: '2030-06-10T11:00:00.000Z',
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: /Reschedule/ })
    await canvas.findByRole('button', { name: /Cancel booking/ })
  },
}

/** Owner of a finished job: Repost this task, and the Activity strip is done. */
export const OwnerFinishedJob: Story = {
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
    await within(canvasElement).findByRole('link', { name: /Repost this task/ })
  },
}
