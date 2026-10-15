import { Stack } from '@chakra-ui/react'
import {
  OrderRequestKind,
  OrderStatus,
  QuoteStatus,
  TaskStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import type { OrderItem } from '@/utils/orderHelpers'
import { Card } from '@ui'

import { withTaskDetailStory } from '../../../helpers/taskDetailStoryDecorator'
import {
  STORY_OWNER_ID,
  STORY_WORKER_ID,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../../helpers/taskDetailStoryFixtures'
import { RequestFact } from './BookingActionFacts'

/**
 * A pending reschedule or cancellation. The headline says who asked; this row
 * shows the proposed times and, for the other side, the answer buttons.
 * (Withdrawing your own request is in Help & actions.)
 */
const meta = {
  title: 'Task detail/Summary/BookingActionFacts',
  component: RequestFact,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Card layout="section" framed maxW="560px">
        <Stack gap={0}>
          <Story />
        </Stack>
      </Card>
    ),
  ],
} satisfies Meta<typeof RequestFact>

export default meta
type Story = StoryObj<typeof meta>

const AT = '2026-10-15T10:00:00.000Z'
const FUTURE_START = '2030-06-10T09:00:00.000Z'
const FUTURE_END = '2030-06-10T11:00:00.000Z'

const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
})

const slots = [
  {
    id: 'slot-r1',
    start: '2030-06-12T09:00:00.000Z',
    end: '2030-06-12T11:00:00.000Z',
  },
  { id: 'slot-r2', start: '2030-06-13T14:00:00.000Z', end: null },
]

/** The owner's view of an order with one request, made by `by`. */
function request(
  kind: OrderRequestKind,
  by: string,
  extra: Partial<OrderItem> = {},
): Story {
  return {
    decorators: [
      withTaskDetailStory(
        {
          viewer: 'owner',
          task: bookedTask,
          order: storyTaskOrder({
            status:
              kind === OrderRequestKind.Reschedule
                ? OrderStatus.Rescheduling
                : OrderStatus.CancelRequested,
            bookedStart: FUTURE_START,
            bookedEnd: FUTURE_END,
            pendingRequest: {
              kind,
              requestedByUserId: by,
              requestedAt: AT,
              proposedSlots: kind === OrderRequestKind.Reschedule ? slots : [],
            },
            ...extra,
          }),
        },
        { maxWidth: '640px' },
      ),
    ],
  }
}

/** The worker proposed two new times: Use this time on each, or Keep current time. */
export const RescheduleFromThem: Story = {
  ...request(OrderRequestKind.Reschedule, STORY_WORKER_ID),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findAllByRole('button', { name: 'Use this time' })
    await canvas.findByRole('button', { name: 'Keep current time' })
  },
}

/** Your own proposal: the times only, with no buttons (withdraw is in Help & actions). */
export const RescheduleFromMe: Story = {
  ...request(OrderRequestKind.Reschedule, STORY_OWNER_ID),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Proposed times')
    expect(canvas.queryByRole('button', { name: 'Use this time' })).toBeNull()
  },
}

/** A proposed time has already passed: it is marked and cannot be picked. */
export const ReschedulePassedTime: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: bookedTask,
        order: storyTaskOrder({
          status: OrderStatus.Rescheduling,
          bookedStart: FUTURE_START,
          bookedEnd: FUTURE_END,
          pendingRequest: {
            kind: OrderRequestKind.Reschedule,
            requestedByUserId: STORY_WORKER_ID,
            requestedAt: AT,
            proposedSlots: [
              { id: 'slot-past', start: '2020-06-12T09:00:00.000Z', end: null },
              slots[1],
            ],
          },
        }),
      },
      { maxWidth: '640px' },
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(/Passed/)
    await waitFor(() => {
      const [first] = canvas.getAllByRole('button', { name: 'Use this time' })
      expect(first).toBeDisabled()
    })
  },
}

/** The worker asked to cancel: the lapse note, then Accept cancellation or Keep booking. */
export const CancelFromThem: Story = {
  ...request(OrderRequestKind.Cancel, STORY_WORKER_ID),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(/the request lapses/)
    await canvas.findByRole('button', { name: 'Accept cancellation' })
    await canvas.findByRole('button', { name: 'Keep booking' })
  },
}

/** You asked to cancel: only the note that it lapses at the booked time. */
export const CancelFromMe: Story = {
  ...request(OrderRequestKind.Cancel, STORY_OWNER_ID),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(/the request lapses/)
    expect(
      canvas.queryByRole('button', { name: 'Accept cancellation' }),
    ).toBeNull()
  },
}

/** Cancel asked during a conflict: no lapse note, just the answer buttons. */
export const CancelFromThemInConflict: Story = {
  ...request(OrderRequestKind.Cancel, STORY_WORKER_ID, {
    status: OrderStatus.Conflict,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Accept cancellation' })
    expect(canvas.queryByText(/the request lapses/)).toBeNull()
  },
}

/** Your own cancel request during a conflict: nothing to show in the row. */
export const CancelFromMeInConflict: Story = {
  ...request(OrderRequestKind.Cancel, STORY_OWNER_ID, {
    status: OrderStatus.Conflict,
  }),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).queryByRole('button')).toBeNull(),
    )
  },
}
