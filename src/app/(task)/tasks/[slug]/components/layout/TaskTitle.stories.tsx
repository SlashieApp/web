import { type OrderStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskTitle } from './TaskTitle'

const meta: Meta<typeof TaskTitle> = {
  title: 'task/tasks/layout/TaskTitle',
  component: TaskTitle,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Completed badge + date while the task listing is still in progress. */
export const Completed: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'customer',
      task: storyTaskDetail({ status: TaskStatus.InProgress }),
      order: storyTaskOrder({
        status: 'COMPLETED' as OrderStatus,
        closedAt: '2026-05-20T16:00:00.000Z',
      }),
    }),
  ],
}
