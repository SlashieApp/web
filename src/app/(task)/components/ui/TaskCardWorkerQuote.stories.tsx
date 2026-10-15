import { Box } from '@chakra-ui/react'
import {
  Currency,
  OrderStatus,
  QuoteStatus,
  TaskDateTimeType,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  storyOrder,
  storyQuote,
  storyQuoteRow,
  storyTask,
} from '@/app/(dashboard)/quotes/components/workerQuoteStoryFixtures'

import { TaskCardWorkerQuote } from './TaskCardWorkerQuote'

/** A worker's sent quote as a card; it expands to the message and progress. */
const meta = {
  title: 'Tasks/TaskCardWorkerQuote',
  component: TaskCardWorkerQuote,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    variant: 'workerQuote',
    ...storyQuoteRow({
      quote: storyQuote({ status: 'PENDING' }),
      workerOrder: null,
    }),
  },
  decorators: [
    (Story) => (
      <Box maxW="520px" w="full">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskCardWorkerQuote>

export default meta
type Story = StoryObj<typeof meta>

const bookedTask = storyTask({
  title: 'Fix leaking tap',
  categories: ['PLUMBING'],
  datetime: {
    date: '2030-06-21',
    time: '14:00',
    type: TaskDateTimeType.Exact,
  },
  location: { lat: 51.5014, lng: -0.1419, name: 'Westminster', address: null },
})

const bookedQuote = storyQuote({
  status: 'ACCEPTED',
  price: { amount: 95, currency: Currency.Gbp },
  message:
    "Hi! I can fix the tap and check for any leaks. I'll bring all tools and parts.",
  createdAt: '2026-06-20T10:00:00.000Z',
})

const activeOrder = storyOrder({
  status: OrderStatus.Active,
  createdAt: '2026-06-20T14:00:00.000Z',
  agreedPrice: { amount: 95, currency: Currency.Gbp },
})

/** Quote sent and waiting: collapsed, with the "Quote sent" badge. */
export const PendingCollapsed: Story = {}

/** Pending, opened: the message and the Sent, Accepted, Completed progress. */
export const PendingExpanded: Story = {
  args: { initialExpanded: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Your message')
  },
}

/** Pending quote sent without a message: the panel says so. */
export const PendingNoMessage: Story = {
  args: {
    ...storyQuoteRow({
      quote: storyQuote({ status: 'PENDING', message: null }),
      workerOrder: null,
    }),
    initialExpanded: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('No message included with this quote.')
  },
}

/** Task has no photo: the thumbnail falls back to its placeholder. */
export const PendingNoThumbnail: Story = {
  args: {
    ...storyQuoteRow({
      task: storyTask({ images: [] }),
      quote: storyQuote({ status: 'PENDING' }),
      workerOrder: null,
    }),
  },
}

/** Task with no budget type and a long title: no price badge, two-line title. */
export const PendingLongTitleNoBudgetType: Story = {
  args: {
    ...storyQuoteRow({
      task: storyTask({
        title:
          'Assemble a flat-pack wardrobe, two bedside tables and a chest of drawers in the second-floor bedroom',
        budget: null,
      }),
      quote: storyQuote({ status: 'PENDING' }),
      workerOrder: null,
    }),
  },
}

/** Quote accepted and the job is on: "Booked", collapsed. */
export const BookedCollapsed: Story = {
  args: {
    ...storyQuoteRow({
      task: bookedTask,
      quote: bookedQuote,
      workerOrder: activeOrder,
    }),
  },
}

/** Booked, opened: schedule, countdown, Open in Maps and Contact customer. */
export const BookedExpanded: Story = {
  args: {
    ...storyQuoteRow({
      task: bookedTask,
      quote: bookedQuote,
      workerOrder: activeOrder,
    }),
    initialExpanded: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('link', { name: /Open in Maps/ })
    await canvas.findByRole('link', { name: /Contact customer/ })
  },
}

/** Booked task with no exact point: Contact customer without Open in Maps. */
export const BookedNoCoordinates: Story = {
  args: {
    ...storyQuoteRow({
      task: { ...bookedTask, location: { name: 'Westminster', address: null } },
      quote: bookedQuote,
      workerOrder: activeOrder,
    }),
    initialExpanded: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('link', { name: /Contact customer/ })
    expect(canvas.queryByRole('link', { name: /Open in Maps/ })).toBeNull()
  },
}

/** Job finished: "Completed", collapsed. */
export const CompletedCollapsed: Story = {
  args: {
    ...storyQuoteRow({
      quote: storyQuote({ status: 'ACCEPTED' }),
      workerOrder: storyOrder({
        status: OrderStatus.Completed,
        closedAt: '2026-05-20T16:00:00.000Z',
      }),
    }),
  },
}

/** Completed, opened: all three progress steps are done, no job footer. */
export const CompletedExpanded: Story = {
  args: {
    ...storyQuoteRow({
      quote: storyQuote({ status: 'ACCEPTED' }),
      workerOrder: storyOrder({
        status: OrderStatus.Completed,
        closedAt: '2026-05-20T16:00:00.000Z',
      }),
    }),
    initialExpanded: true,
  },
}

/** The customer declined this quote: "Closed". */
export const EndedDeclined: Story = {
  args: {
    ...storyQuoteRow({
      quote: storyQuote({ status: 'DECLINED' }),
      workerOrder: null,
    }),
  },
}

/** Another worker was booked on the task: "Closed". */
export const EndedAnotherWorkerBooked: Story = {
  args: {
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

/** The customer cancelled the task: "Closed". */
export const EndedTaskCancelled: Story = {
  args: {
    ...storyQuoteRow({
      task: storyTask({ status: 'CANCELLED' }),
      quote: storyQuote({ status: 'PENDING' }),
      workerOrder: null,
    }),
  },
}

/** The card toggles open and closed from its header. */
export const TogglesOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Expand quote details' }),
    )
    await canvas.findByText('Your message')
    await userEvent.click(
      canvas.getByRole('button', { name: 'Collapse quote details' }),
    )
    expect(canvas.queryByText('Your message')).toBeNull()
  },
}
