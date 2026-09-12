import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  Currency,
  OrderStatus,
  QuoteStatus,
  TaskDateTimeType,
} from '@codegen/schema'

import {
  storyOrder,
  storyQuote,
  storyQuoteRow,
  storyTask,
} from '@/app/(dashboard)/quotes/components/workerQuoteStoryFixtures'

import {
  TaskCard,
  type TaskCardProps,
  type TaskCardTask,
  type TaskCardWorkerQuoteProps,
} from './TaskCard'

type TaskCardBrowseProps = Exclude<TaskCardProps, TaskCardWorkerQuoteProps>

const defaultTask: TaskCardTask = {
  id: 'task-1',
  title: 'Mount a 55-inch TV',
  description: 'Need a worker to mount one TV safely on a plasterboard wall.',
  location: 'Southwark',
  priceLabel: '£120',
  badgeText: 'Tech setup',
  distanceLabel: '1.2 miles',
  timingLabel: 'Flexible',
  thumbnailSrc:
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop',
  trust: { kind: 'verified' },
}

const listMeta = {
  title: 'task/TaskCard',
  component: TaskCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    task: defaultTask,
    detailsHref: '/tasks/task-1',
  },
  render: (args: TaskCardBrowseProps) => (
    <Box maxW="520px" w="full">
      <TaskCard {...args} />
    </Box>
  ),
} satisfies Meta<TaskCardBrowseProps>

const workerQuoteMeta = {
  title: 'task/TaskCard/WorkerQuote',
  component: TaskCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  render: (args: TaskCardWorkerQuoteProps) => (
    <Box maxW="520px" w="full">
      <TaskCard {...args} />
    </Box>
  ),
} satisfies Meta<TaskCardWorkerQuoteProps>

export default listMeta

type ListStory = StoryObj<typeof listMeta>
type WorkerQuoteStory = StoryObj<typeof workerQuoteMeta>

export const Default: ListStory = {}

export const LongTitle: ListStory = {
  args: {
    task: {
      ...defaultTask,
      title:
        'Need someone to mount a 55-inch TV, hide the cables in the wall, and tidy the living-room plaster this weekend',
    },
  },
}

export const MissingBudget: ListStory = {
  args: {
    task: {
      ...defaultTask,
      priceLabel: '',
    },
  },
}

export const EmptyTrust: ListStory = {
  args: {
    task: {
      ...defaultTask,
      trust: undefined,
    },
  },
}

export const ListItemSaved: ListStory = {
  args: {
    isSaved: true,
    onToggleSave: () => {},
  },
}

export const ListItemExpanded: ListStory = {
  args: {
    isActive: true,
    isExpanded: true,
    showDetailsCta: true,
    detailsCtaLabel: 'View task',
  },
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
}

export const WorkerQuotePendingCollapsed: WorkerQuoteStory = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      quote: storyQuote({ status: 'PENDING' }),
      workerOrder: null,
    }),
  },
}

export const WorkerQuotePendingExpanded: WorkerQuoteStory = {
  args: {
    ...WorkerQuotePendingCollapsed.args,
    initialExpanded: true,
  },
}

export const WorkerQuotePendingNoMessage: WorkerQuoteStory = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      quote: storyQuote({ status: 'PENDING', message: null }),
      workerOrder: null,
    }),
  },
}

export const WorkerQuotePendingNoThumbnail: WorkerQuoteStory = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      task: storyTask({ images: [] }),
      quote: storyQuote({ status: 'PENDING' }),
      workerOrder: null,
    }),
  },
}

export const WorkerQuoteBookedActiveJob: WorkerQuoteStory = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      task: storyTask({
        title: 'Fix leaking tap',
        category: 'PLUMBING',
        datetime: {
          date: '2026-06-21',
          time: '14:00',
          type: TaskDateTimeType.Exact,
        },
        location: {
          lat: 51.5014,
          lng: -0.1419,
          name: 'Westminster',
          address: null,
        },
      }),
      quote: storyQuote({
        status: 'ACCEPTED',
        price: { amount: 95, currency: Currency.Gbp },
        message:
          "Hi! I can fix the tap and check for any leaks. I'll bring all tools and parts.",
        createdAt: '2026-06-20T10:00:00.000Z',
      }),
      workerOrder: storyOrder({
        status: OrderStatus.Active,
        createdAt: '2026-06-20T14:00:00.000Z',
        agreedPrice: { amount: 95, currency: Currency.Gbp },
      }),
    }),
  },
}

export const WorkerQuoteBookedActiveJobExpanded: WorkerQuoteStory = {
  args: {
    ...WorkerQuoteBookedActiveJob.args,
    initialExpanded: true,
  },
}

export const WorkerQuoteCompletedOrder: WorkerQuoteStory = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      quote: storyQuote({ status: 'ACCEPTED' }),
      workerOrder: storyOrder({
        status: OrderStatus.Closed,
        closedAt: '2026-05-20T16:00:00.000Z',
      }),
    }),
  },
}

export const WorkerQuoteCompletedOrderExpanded: WorkerQuoteStory = {
  args: {
    ...WorkerQuoteCompletedOrder.args,
    initialExpanded: true,
  },
}

export const WorkerQuoteEndedDeclined: WorkerQuoteStory = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      quote: storyQuote({ status: 'DECLINED' }),
      workerOrder: null,
    }),
  },
}

export const WorkerQuoteEndedAnotherWorkerBooked: WorkerQuoteStory = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      task: storyTask({
        quotes: [
          {
            id: 'quote-other',
            taskId: 'task-story-1',
            workerUserId: 'worker-other',
            price: { amount: 90, currency: Currency.Gbp },
            message: null,
            status: QuoteStatus.Accepted,
            createdAt: '2026-05-30T10:00:00.000Z',
          },
        ],
      }),
      quote: storyQuote({ status: 'PENDING' }),
      workerOrder: null,
    }),
  },
}

export const WorkerQuoteEndedTaskCancelled: WorkerQuoteStory = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      task: storyTask({ status: 'CANCELLED' }),
      quote: storyQuote({ status: 'PENDING' }),
      workerOrder: null,
    }),
  },
}
