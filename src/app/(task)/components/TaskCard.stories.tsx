import { Box } from '@chakra-ui/react'
import { Currency, OrderStatus, QuoteStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  storyOrder,
  storyQuote,
  storyQuoteRow,
  storyTask,
} from '@/app/(dashboard)/quotes/components/workerQuoteStoryFixtures'

import { TaskCard } from './TaskCard'

const meta = {
  title: 'task/TaskCard',
  component: TaskCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  render: (args) => (
    <Box maxW="520px" w="full">
      <TaskCard {...args} />
    </Box>
  ),
} satisfies Meta<typeof TaskCard>

export default meta

type Story = StoryObj<typeof meta>

export const ListItem: Story = {
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

export const ListItemExpanded: Story = {
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

export const WorkerQuotePendingCollapsed: Story = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      quote: storyQuote({ status: 'PENDING' }),
      workerOrder: null,
    }),
  },
}

export const WorkerQuotePendingExpanded: Story = {
  args: {
    ...WorkerQuotePendingCollapsed.args,
    initialExpanded: true,
  },
}

export const WorkerQuotePendingNoMessage: Story = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      quote: storyQuote({ status: 'PENDING', message: null }),
      workerOrder: null,
    }),
  },
}

export const WorkerQuotePendingNoThumbnail: Story = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      task: storyTask({ images: [] }),
      quote: storyQuote({ status: 'PENDING' }),
      workerOrder: null,
    }),
  },
}

export const WorkerQuoteBookedActiveJob: Story = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      quote: storyQuote({ status: 'ACCEPTED' }),
      workerOrder: storyOrder({ status: OrderStatus.Active }),
    }),
  },
}

export const WorkerQuoteBookedActiveJobExpanded: Story = {
  args: {
    ...WorkerQuoteBookedActiveJob.args,
    initialExpanded: true,
  },
}

export const WorkerQuoteCompletedOrder: Story = {
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

export const WorkerQuoteCompletedOrderExpanded: Story = {
  args: {
    ...WorkerQuoteCompletedOrder.args,
    initialExpanded: true,
  },
}

export const WorkerQuoteEndedDeclined: Story = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      quote: storyQuote({ status: 'DECLINED' }),
      workerOrder: null,
    }),
  },
}

export const WorkerQuoteEndedAnotherWorkerBooked: Story = {
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

export const WorkerQuoteEndedTaskCancelled: Story = {
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      task: storyTask({ status: 'CANCELLED' }),
      quote: storyQuote({ status: 'PENDING' }),
      workerOrder: null,
    }),
  },
}
