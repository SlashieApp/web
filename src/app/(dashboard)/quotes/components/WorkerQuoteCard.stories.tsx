import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OrderStatus } from '@codegen/schema'

import { WorkerQuoteCard } from './WorkerQuoteCard'
import {
  storyOrder,
  storyQuote,
  storyQuoteRow,
  storyTask,
} from './workerQuoteStoryFixtures'

const meta = {
  title: 'quotes/WorkerQuoteCard',
  component: WorkerQuoteCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  render: (args) => (
    <Box maxW="520px" w="full">
      <WorkerQuoteCard {...args} />
    </Box>
  ),
} satisfies Meta<typeof WorkerQuoteCard>

export default meta

type Story = StoryObj<typeof meta>

export const PendingCollapsed: Story = {
  args: storyQuoteRow({
    quote: storyQuote({ status: 'PENDING' }),
    workerOrder: null,
  }),
}

export const PendingExpanded: Story = {
  args: {
    ...PendingCollapsed.args,
    initialExpanded: true,
  },
}

export const PendingNoMessage: Story = {
  args: storyQuoteRow({
    quote: storyQuote({ status: 'PENDING', message: null }),
    workerOrder: null,
  }),
}

export const PendingNoThumbnail: Story = {
  args: storyQuoteRow({
    task: storyTask({ images: [] }),
    quote: storyQuote({ status: 'PENDING' }),
    workerOrder: null,
  }),
}

export const BookedActiveJob: Story = {
  args: storyQuoteRow({
    quote: storyQuote({ status: 'ACCEPTED' }),
    workerOrder: storyOrder({ status: OrderStatus.Active }),
  }),
}

export const BookedActiveJobExpanded: Story = {
  args: {
    ...BookedActiveJob.args,
    initialExpanded: true,
  },
}

export const CompletedOrder: Story = {
  args: storyQuoteRow({
    quote: storyQuote({ status: 'ACCEPTED' }),
    workerOrder: storyOrder({
      status: OrderStatus.Closed,
      closedAt: '2026-05-20T16:00:00.000Z',
    }),
  }),
}

export const CompletedOrderExpanded: Story = {
  args: {
    ...CompletedOrder.args,
    initialExpanded: true,
  },
}

export const EndedQuoteDeclined: Story = {
  args: storyQuoteRow({
    quote: storyQuote({ status: 'DECLINED' }),
    workerOrder: null,
  }),
}

export const EndedAnotherWorkerBooked: Story = {
  args: storyQuoteRow({
    task: storyTask({
      quotes: [
        {
          id: 'quote-other',
          taskId: 'task-story-1',
          workerUserId: 'worker-other',
          price: { amount: 90, currency: 'GBP' },
          message: null,
          status: 'ACCEPTED',
          createdAt: '2026-05-30T10:00:00.000Z',
        },
      ],
    }),
    quote: storyQuote({ status: 'PENDING' }),
    workerOrder: null,
  }),
}

export const EndedTaskCancelled: Story = {
  args: storyQuoteRow({
    task: storyTask({ status: 'CANCELLED' }),
    quote: storyQuote({ status: 'PENDING' }),
    workerOrder: null,
  }),
}
