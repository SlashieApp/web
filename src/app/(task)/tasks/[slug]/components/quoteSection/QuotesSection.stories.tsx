import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OrderStatus, QuoteStatus } from '@codegen/schema'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  STORY_WORKER_ID,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'

import { QuotesSection } from './QuotesSection'

const meta = {
  title: 'task/QuoteSection/QuotesSection',
  component: QuotesSection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '560px' })],
} satisfies Meta<typeof QuotesSection>

export default meta

type Story = StoryObj<typeof meta>

export const OwnerWithQuotes: Story = {}

export const OwnerNoQuotes: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'owner', task: storyTaskDetail({ quotes: [] }) },
      { maxWidth: '560px' },
    ),
  ],
}

export const OwnerWithActiveOrder: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        order: storyTaskOrder({ status: OrderStatus.Active }),
      },
      { maxWidth: '560px' },
    ),
  ],
}

export const VisitorLoggedOut: Story = {
  decorators: [
    withTaskDetailStory({ viewer: 'visitor' }, { maxWidth: '560px' }),
  ],
}

export const WorkerWithAcceptedQuote: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({
          quotes: [
            storyTaskQuote({
              workerUserId: STORY_WORKER_ID,
              status: QuoteStatus.Accepted,
            }),
          ],
        }),
        order: storyTaskOrder({ status: OrderStatus.Active }),
      },
      { maxWidth: '560px' },
    ),
  ],
}

export const WorkerWithOwnPendingQuote: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({
          quotes: [
            storyTaskQuote({
              workerUserId: STORY_WORKER_ID,
              status: QuoteStatus.Pending,
            }),
          ],
        }),
      },
      { maxWidth: '560px' },
    ),
  ],
}
