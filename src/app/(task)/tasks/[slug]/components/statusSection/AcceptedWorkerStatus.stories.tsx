import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  StoryOrderStatus,
  StoryTaskContactMethod,
} from '@/storybook/storyLiterals'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'

import { AcceptedWorkerStatus } from './AcceptedWorkerStatus'

const meta = {
  title: 'task/StatusSection/AcceptedWorkerStatus',
  component: AcceptedWorkerStatus,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      order: storyTaskOrder({ status: StoryOrderStatus.Active }),
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
          method: StoryTaskContactMethod.Email,
          phone: null,
          email: 'alex@example.com',
        },
      }),
      order: storyTaskOrder({ status: StoryOrderStatus.Active }),
    }),
  ],
}
