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
  type TaskCardWorkerQuoteProps,
} from './TaskCard'

type TaskCardBrowseProps = Exclude<TaskCardProps, TaskCardWorkerQuoteProps>

const listMeta = {
  title: 'task/TaskCard',
  component: TaskCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
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

export const ListItem: ListStory = {
  args: {
    title: 'Fix shelf on wall',
    description: 'Need a worker to mount one shelf safely.',
    priceLabel: '£10',
    metaLine: '33 Charing Cross Road',
    distanceLabel: '0.4 mi away',
    ownerName: 'John D.',
    ratingLabel: '4.9 ',
    ownerAvatarSrc:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    thumbnailSrc:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop',
    detailsHref: '/tasks/task-1',
    badgeText: 'New',
  },
}

export const ListItemExpanded: ListStory = {
  args: {
    ...ListItem.args,
    isActive: true,
    isExpanded: true,
    showDetailsCta: true,
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
