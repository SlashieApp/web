import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { StoryOrderStatus } from '@/storybook/storyLiterals'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'

import { CustomerActiveOrderStatus } from './CustomerActiveOrderStatus'

const meta = {
  title: 'task/StatusSection/CustomerActiveOrderStatus',
  component: CustomerActiveOrderStatus,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CustomerActiveOrderStatus>

export default meta

type Story = StoryObj<typeof meta>

export const JobInProgress: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'customer',
      order: storyTaskOrder({
        status: StoryOrderStatus.Active,
        completionVerificationCode: '482913',
      }),
    }),
  ],
}

export const NoCompletionCodeYet: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'customer',
      order: storyTaskOrder({
        status: StoryOrderStatus.Active,
        completionVerificationCode: null,
      }),
    }),
  ],
}

export const ClosedWithInvoice: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'customer',
      task: storyTaskDetail(),
      order: storyTaskOrder({
        status: StoryOrderStatus.Closed,
        closedAt: '2026-05-20T16:00:00.000Z',
      }),
    }),
  ],
}
