import { OrderStatus, QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  STORY_WORKER_ID,
  type TaskDetailStoryConfig,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskDetailView } from './TaskDetailView'

/**
 * Mirror of the page-level composition (`tasks/[slug]/page.tsx` renders one
 * CSS-responsive tree: mobile hero below `lg`, desktop page column + map
 * overlay from `lg` up — never the 460px search-list shell).
 */
function TaskTripDetailPreview() {
  return <TaskDetailView />
}

const meta = {
  title: 'task/tasks/tripDetail/TaskTripDetail',
  component: TaskTripDetailPreview,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TaskTripDetailPreview>

export default meta
type Story = StoryObj<typeof meta>

/**
 * One story per state-matrix case. The decorator seeds the fixture task into
 * the provider (and the order/quotes into the Apollo cache), so the rendered
 * hero matches the seeded permission flags.
 */
function tripStory(config: TaskDetailStoryConfig): Story {
  return {
    decorators: [withTaskDetailStory(config)],
    render: () => <TaskTripDetailPreview />,
  }
}

export const VisitorOpen = tripStory({
  viewer: 'visitor',
  task: storyTaskDetail({ status: TaskStatus.Open }),
})

export const WorkerOpenNoQuote = tripStory({
  viewer: 'worker',
  task: storyTaskDetail({ status: TaskStatus.Open, quotes: [] }),
})

export const WorkerQuotePending = tripStory({
  viewer: 'worker',
  task: storyTaskDetail({
    status: TaskStatus.Open,
    quotes: [
      storyTaskQuote({
        workerUserId: STORY_WORKER_ID,
        status: QuoteStatus.Pending,
      }),
    ],
  }),
})

export const OwnerLiveNoQuotes = tripStory({
  viewer: 'owner',
  task: storyTaskDetail({ status: TaskStatus.Open, quotes: [] }),
})

export const OwnerWithQuotes = tripStory({
  viewer: 'owner',
  task: storyTaskDetail({ status: TaskStatus.Open }),
})

export const OwnerAwardedWithCode = tripStory({
  viewer: 'customer',
  task: storyTaskDetail({ status: TaskStatus.QuoteAccepted }),
  order: storyTaskOrder({
    status: OrderStatus.Active,
    completionVerificationCode: '482913',
  }),
})

export const WorkerJobConfirmed = tripStory({
  viewer: 'worker',
  task: storyTaskDetail({ status: TaskStatus.QuoteAccepted }),
  order: storyTaskOrder({ status: OrderStatus.Active }),
})

export const Closed = tripStory({
  viewer: 'owner',
  task: storyTaskDetail({ status: TaskStatus.Completed }),
  order: storyTaskOrder({ status: OrderStatus.Closed }),
})

export const Cancelled = tripStory({
  viewer: 'owner',
  task: storyTaskDetail({ status: TaskStatus.Cancelled }),
})
