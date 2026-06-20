import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { StoryOrderStatus, StoryQuoteStatus } from '@/storybook/storyLiterals'

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
        order: storyTaskOrder({ status: StoryOrderStatus.Active }),
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
              status: StoryQuoteStatus.Accepted,
            }),
          ],
        }),
        order: storyTaskOrder({ status: StoryOrderStatus.Active }),
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
              status: StoryQuoteStatus.Pending,
            }),
          ],
        }),
      },
      { maxWidth: '560px' },
    ),
  ],
}
