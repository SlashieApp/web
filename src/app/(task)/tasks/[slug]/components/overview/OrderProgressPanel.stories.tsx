import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OrderCloseKind, OrderRequestKind, OrderStatus } from '@codegen/schema'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  STORY_OWNER_ID,
  STORY_WORKER_ID,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'

import { OrderProgressPanel } from './OrderProgressPanel'

const FUTURE_START = '2030-06-10T09:00:00.000Z'
const AUTO_DONE = '2030-06-17T09:00:00.000Z'
const PROPOSED = [
  {
    id: 'r1',
    start: '2030-06-12T09:00:00.000Z',
    end: '2030-06-12T11:00:00.000Z',
  },
  { id: 'r2', start: '2030-06-13T14:00:00.000Z', end: null },
]

/** Booking states as the owner sees them (the worker sees the mirror). */
const meta = {
  title: 'task/tasks/overview/OrderProgressPanel',
  component: OrderProgressPanel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrderProgressPanel>

export default meta

type Story = StoryObj<typeof meta>

const owner = (order: Parameters<typeof storyTaskOrder>[0]) =>
  withTaskDetailStory({ viewer: 'customer', order: storyTaskOrder(order) })

export const BeforeStart: Story = {
  decorators: [owner({ bookedStart: FUTURE_START, bookedEnd: null })],
}

/** Done/Failed are open; the slide itself sits on the main CTA. */
export const ReadyToClose: Story = { decorators: [owner({})] }

export const YouMarkedDone: Story = {
  decorators: [
    owner({
      myCloseAction: {
        kind: OrderCloseKind.Done,
        at: '2026-06-10T17:00:00.000Z',
      },
      autoDoneAt: AUTO_DONE,
    }),
  ],
}

export const WorkerMarkedDone: Story = {
  decorators: [
    owner({
      counterpartyCloseAction: {
        kind: OrderCloseKind.Done,
        at: '2026-06-10T17:00:00.000Z',
      },
      autoDoneAt: AUTO_DONE,
    }),
  ],
}

export const WorkerMarkedFailed: Story = {
  decorators: [
    owner({
      counterpartyCloseAction: {
        kind: OrderCloseKind.Failed,
        at: '2026-06-10T17:00:00.000Z',
      },
    }),
  ],
}

export const RescheduleRequestedByWorker: Story = {
  decorators: [
    owner({
      status: OrderStatus.Rescheduling,
      bookedStart: FUTURE_START,
      bookedEnd: null,
      pendingRequest: {
        kind: OrderRequestKind.Reschedule,
        requestedByUserId: STORY_WORKER_ID,
        requestedAt: '2026-06-01T10:00:00.000Z',
        proposedSlots: PROPOSED,
      },
    }),
  ],
}

export const YourRescheduleRequest: Story = {
  decorators: [
    owner({
      status: OrderStatus.Rescheduling,
      bookedStart: FUTURE_START,
      bookedEnd: null,
      pendingRequest: {
        kind: OrderRequestKind.Reschedule,
        requestedByUserId: STORY_OWNER_ID,
        requestedAt: '2026-06-01T10:00:00.000Z',
        proposedSlots: PROPOSED,
      },
    }),
  ],
}

export const CancelRequestedByWorker: Story = {
  decorators: [
    owner({
      status: OrderStatus.CancelRequested,
      bookedStart: FUTURE_START,
      bookedEnd: null,
      pendingRequest: {
        kind: OrderRequestKind.Cancel,
        requestedByUserId: STORY_WORKER_ID,
        requestedAt: '2026-06-01T10:00:00.000Z',
        proposedSlots: [],
      },
    }),
  ],
}

/** Help and report first; either party can ask to cancel. */
export const Conflict: Story = {
  decorators: [
    owner({
      status: OrderStatus.Conflict,
      myCloseAction: {
        kind: OrderCloseKind.Done,
        at: '2026-06-10T17:00:00.000Z',
      },
      counterpartyCloseAction: {
        kind: OrderCloseKind.Failed,
        at: '2026-06-10T18:00:00.000Z',
      },
    }),
  ],
}
