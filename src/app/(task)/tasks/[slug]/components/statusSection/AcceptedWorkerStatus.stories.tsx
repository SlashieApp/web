import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OrderStatus, TaskContactMethod } from '@codegen/schema'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'

import { AcceptedWorkerStatus } from './AcceptedWorkerStatus'

const meta = {
  title: 'taskDetail/StatusSection/AcceptedWorkerStatus',
  component: AcceptedWorkerStatus,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      order: storyTaskOrder({ status: OrderStatus.Active }),
    }),
  ],
} satisfies Meta<typeof AcceptedWorkerStatus>

export default meta

type Story = StoryObj<typeof meta>

export const ActiveJob: Story = {}

export const WithEmailContact: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: storyTaskDetail({
        posterContact: {
          method: TaskContactMethod.Email,
          phone: null,
          email: 'alex@example.com',
        },
      }),
      order: storyTaskOrder({ status: OrderStatus.Active }),
    }),
  ],
}
