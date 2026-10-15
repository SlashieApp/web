import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskStatus } from '@codegen/schema'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'

import { TaskDetailMainCta } from './TaskDetailMainCta'

const meta: Meta<typeof TaskDetailMainCta> = {
  title: 'task/tasks/layout/TaskDetailMainCta',
  component: TaskDetailMainCta,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Owner of an open task: Preview. */
export const Default: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
}

/** Booked time has started: slide Done or "something went wrong". */
export const WorkerReadyToClose: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: storyTaskDetail({ status: TaskStatus.Awarded }),
      order: storyTaskOrder(),
    }),
  ],
}

/** Before the booked time: contact the customer. */
export const WorkerBeforeStart: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: storyTaskDetail({ status: TaskStatus.Awarded }),
      order: storyTaskOrder({
        bookedStart: '2030-06-10T09:00:00.000Z',
        bookedEnd: null,
      }),
    }),
  ],
}
