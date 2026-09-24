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
  title: 'task/tasks/overview/OrderSection',
  component: OrderSection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    withTaskDetailStory({ viewer: 'customer' }, { maxWidth: '560px' }),
  ],
} satisfies Meta<typeof OrderSection>

export default meta

type Story = StoryObj<typeof meta>

const completedOrder = storyTaskOrder({
  // BE-58 renames CLOSED → COMPLETED. The generated enum may still be CLOSED.
  status: 'COMPLETED' as OrderStatus,
  workCompletedAt: '2026-05-19T11:30:00.000Z',
  workerPaymentAcknowledgedAt: '2026-05-20T09:15:00.000Z',
  closedAt: '2026-05-20T16:00:00.000Z',
  customerUserId: STORY_OWNER_ID,
})

export const Completed: Story = {
  args: {
    task: storyTaskDetail(),
    order: completedOrder,
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
