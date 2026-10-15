import { TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskTitle } from './TaskTitle'

/**
 * Sticky title: back control (phones), title, meta chips, and the phones'
 * Help & actions menu. The status badge lives on the Task summary.
 */
const meta: Meta<typeof TaskTitle> = {
  title: 'task/tasks/layout/TaskTitle',
  component: TaskTitle,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

/** Owner of an open task. */
export const Default: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
}

/** Docked: compact one-line title once the chrome sticks. */
export const Stuck: Story = {
  args: { isStuck: true },
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
}

/** Phones: the menu adds the booking actions (Reschedule, Cancel booking). */
export const PhoneMenuBooked: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: storyTaskDetail({ status: TaskStatus.Awarded }),
      order: storyTaskOrder({
        bookedStart: '2030-06-10T14:00:00.000Z',
        bookedEnd: '2030-06-10T16:00:00.000Z',
      }),
    }),
  ],
}
