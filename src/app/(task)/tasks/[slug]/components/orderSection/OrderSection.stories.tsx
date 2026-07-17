import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OrderStatus } from '@codegen/schema'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  STORY_OWNER_ID,
  storyTaskDetail,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'

import { OrderSection } from './OrderSection'

const meta = {
  title: 'task/tasks/orderSection/OrderSection',
  component: OrderSection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    withTaskDetailStory({ viewer: 'customer' }, { maxWidth: '560px' }),
  ],
} satisfies Meta<typeof OrderSection>

export default meta

type Story = StoryObj<typeof meta>

const closedOrder = storyTaskOrder({
  status: OrderStatus.Closed,
  workCompletedAt: '2026-05-19T11:30:00.000Z',
  workerPaymentAcknowledgedAt: '2026-05-20T09:15:00.000Z',
  closedAt: '2026-05-20T16:00:00.000Z',
  customerUserId: STORY_OWNER_ID,
})

export const Closed: Story = {
  args: {
    task: storyTaskDetail(),
    order: closedOrder,
  },
}

export const Cancelled: Story = {
  args: {
    task: storyTaskDetail(),
    order: storyTaskOrder({
      status: OrderStatus.Cancelled,
      closedAt: '2026-05-18T10:00:00.000Z',
      customerUserId: STORY_OWNER_ID,
    }),
  },
}
