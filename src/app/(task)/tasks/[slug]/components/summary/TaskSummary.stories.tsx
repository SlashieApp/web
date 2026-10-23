import { Box, Grid, Stack } from '@chakra-ui/react'
import {
  Currency,
  OrderCloseKind,
  OrderPartyRole,
  OrderRequestKind,
  OrderStatus,
  QuoteStatus,
  TaskStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import type { OrderItem } from '@/utils/orderHelpers'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  STORY_OWNER_ID,
  STORY_WORKER_ID,
  type TaskDetailStoryConfig,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskDetailMainCta } from '../layout/TaskDetailMainCta'
import { TaskHelpCard } from '../overview/TaskHelpCard'
import { TaskSummary } from './TaskSummary'

/**
 * The summary as the page lays it out: the main button top right (pinned at
 * the bottom on phones), the summary, and Help & actions with the view's
 * booking actions. Phones get Help & actions from the title's menu; it shows
 * here at every width so each view's actions are visible.
 */
function SummaryScene() {
  return (
    <Stack gap={5}>
      <Box alignSelf="flex-end" w="min(580px, 50%)">
        <TaskDetailMainCta />
      </Box>
      <Grid
        templateColumns={{ base: '1fr', lg: 'minmax(0, 2fr) minmax(0, 1fr)' }}
        gap={6}
        alignItems="start"
      >
        <TaskSummary />
        <TaskHelpCard />
      </Grid>
    </Stack>
  )
}

/**
 * One story per view, named after it (see `views/README.md`). Owner stories
 * can render the guest view on first load; reload the frame.
 */
const meta: Meta<typeof TaskSummary> = {
  title: 'Task detail/Summary/TaskSummary',
  component: TaskSummary,
  render: () => <SummaryScene />,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

const FUTURE = '2030-06-10T14:00:00.000Z'
const FUTURE_END = '2030-06-10T16:00:00.000Z'
const AT = '2026-10-15T10:00:00.000Z'
const AUTO_DONE = '2026-10-22T10:00:00.000Z'
const done = { kind: OrderCloseKind.Done, at: AT }
const failed = { kind: OrderCloseKind.Failed, at: AT }

const otherWorker = {
  id: 'worker-detail-2',
  profile: { name: 'Sam Taylor', avatarUrl: null },
  worker: { id: 'worker-profile-2', isVerified: false },
}

function quotes(mine: QuoteStatus | null, other: QuoteStatus) {
  return [
    ...(mine ? [storyTaskQuote({ status: mine })] : []),
    storyTaskQuote({
      id: 'quote-detail-2',
      workerUserId: 'worker-detail-2',
      status: other,
      price: { amount: 95, currency: Currency.Gbp },
      worker: otherWorker,
    }),
  ]
}

const openTask = storyTaskDetail()
const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: quotes(QuoteStatus.Accepted, QuoteStatus.NotSelected),
})
const cancelledTask = storyTaskDetail({ status: TaskStatus.Cancelled })

function order(over: Partial<OrderItem> = {}) {
  return storyTaskOrder(over)
}

function request(kind: OrderRequestKind, by: string): Partial<OrderItem> {
  return {
    status:
      kind === OrderRequestKind.Reschedule
        ? OrderStatus.Rescheduling
        : OrderStatus.CancelRequested,
    bookedStart: FUTURE,
    bookedEnd: FUTURE_END,
    pendingRequest: {
      kind,
      requestedByUserId: by,
      requestedAt: AT,
      proposedSlots:
        kind === OrderRequestKind.Reschedule
          ? [
              {
                id: 'slot-r1',
                start: '2030-06-12T09:00:00.000Z',
                end: '2030-06-12T11:00:00.000Z',
              },
            ]
          : [],
    },
  } as Partial<OrderItem>
}

/** The booking states, the same for both parties (the order is viewer-relative). */
function bookingOrders(viewerId: string, otherId: string) {
  return {
    beforeStart: order({ bookedStart: FUTURE, bookedEnd: FUTURE_END }),
    ready: order(),
    iMarkedDone: order({ myCloseAction: done, autoDoneAt: AUTO_DONE }),
    theyMarkedDone: order({
      counterpartyCloseAction: done,
      autoDoneAt: AUTO_DONE,
    }),
    iMarkedFailed: order({ myCloseAction: failed }),
    theyMarkedFailed: order({ counterpartyCloseAction: failed }),
    rescheduleByMe: order(request(OrderRequestKind.Reschedule, viewerId)),
    rescheduleByThem: order(request(OrderRequestKind.Reschedule, otherId)),
    cancelByMe: order(request(OrderRequestKind.Cancel, viewerId)),
    cancelByThem: order(request(OrderRequestKind.Cancel, otherId)),
    conflictDone: order({
      status: OrderStatus.Conflict,
      myCloseAction: done,
      counterpartyCloseAction: failed,
    }),
    conflictFailed: order({
      status: OrderStatus.Conflict,
      myCloseAction: failed,
      counterpartyCloseAction: done,
    }),
    completed: order({
      status: OrderStatus.Completed,
      myCloseAction: done,
      counterpartyCloseAction: done,
      closedAt: AT,
    }),
    cancelled: order({ status: OrderStatus.Cancelled, closedAt: AT }),
    failed: order({
      status: OrderStatus.Cancelled,
      myCloseAction: failed,
      counterpartyCloseAction: failed,
      closedAt: AT,
    }),
  }
}

const ownerOrders = bookingOrders(STORY_OWNER_ID, STORY_WORKER_ID)
const workerOrders = bookingOrders(STORY_WORKER_ID, STORY_OWNER_ID)

function view(config: Partial<TaskDetailStoryConfig>): Story {
  return { decorators: [withTaskDetailStory(config, { maxWidth: '1200px' })] }
}

function owner(o: OrderItem): Story {
  return view({ viewer: 'owner', task: bookedTask, order: o })
}

function worker(o: OrderItem): Story {
  return view({ viewer: 'worker', task: bookedTask, order: o })
}

/** Viewer data still loading: skeleton badge and headline over the public facts. */
export const Loading = view({ viewer: 'owner', task: undefined })

// Owner
/** Owner of an open task with no quotes: live headline and share nudge. */
export const OwnerOpenNoQuotes = view({
  viewer: 'owner',
  task: storyTaskDetail({ quotes: [] }),
})
/** Owner with pending quotes: compare and accept. */
export const OwnerOpenQuotes = view({ viewer: 'owner', task: openTask })
/** Owner, booked, before the start: coordinate, reschedule or cancel. */
export const OwnerBookedBeforeStart = owner(ownerOrders.beforeStart)
/** Owner, booked time has started: mark it Done or report a problem. */
export const OwnerBookedReady = owner(ownerOrders.ready)
/** Owner marked it Done and waits for the worker. */
export const OwnerBookedIMarkedDone = owner(ownerOrders.iMarkedDone)
/** Worker marked it Done: the owner marks it Done too. */
export const OwnerBookedTheyMarkedDone = owner(ownerOrders.theyMarkedDone)
/** Owner marked it Failed and waits for the worker. */
export const OwnerBookedIMarkedFailed = owner(ownerOrders.iMarkedFailed)
/** Worker marked it Failed: the owner can still mark it Done. */
export const OwnerBookedTheyMarkedFailed = owner(ownerOrders.theyMarkedFailed)
/** Owner asked to move the booking and waits for the worker. */
export const OwnerBookedRescheduleByMe = owner(ownerOrders.rescheduleByMe)
/** Worker wants to move the booking: pick a time or keep the current one. */
export const OwnerBookedRescheduleByThem = owner(ownerOrders.rescheduleByThem)
/** Owner asked to cancel and waits for the worker. */
export const OwnerBookedCancelByMe = owner(ownerOrders.cancelByMe)
/** Worker asked to cancel: accept or keep the booking. */
export const OwnerBookedCancelByThem = owner(ownerOrders.cancelByThem)
/** Conflict: the owner marked Done, the worker marked Failed. */
export const OwnerConflictIMarkedDone = owner(ownerOrders.conflictDone)
/** Conflict: the owner marked Failed, the worker marked Done. */
export const OwnerConflictIMarkedFailed = owner(ownerOrders.conflictFailed)
/** Finished job, owner side: the record, reviews and receipt. */
export const OwnerCompleted = owner(ownerOrders.completed)
/** A cancel request was accepted: booking cancelled, repost offered. */
export const OwnerBookingCancelled = owner(ownerOrders.cancelled)
/** Both sides marked Failed: the booking did not go ahead. */
export const OwnerBookingFailed = owner(ownerOrders.failed)
/** The owner cancelled the task. */
export const OwnerCancelled = view({ viewer: 'owner', task: cancelledTask })

// Booked worker
/** Booked worker before the start: coordinate, reschedule or cancel. */
export const WorkerBookedBeforeStart = worker(workerOrders.beforeStart)
/** Booked worker, time has started: mark it Done or report a problem. */
export const WorkerBookedReady = worker(workerOrders.ready)
/** Booked worker marked it Done and waits for the owner. */
export const WorkerBookedIMarkedDone = worker(workerOrders.iMarkedDone)
/** Owner marked it Done: the worker marks it Done too. */
export const WorkerBookedTheyMarkedDone = worker(workerOrders.theyMarkedDone)
/** Booked worker marked it Failed and waits for the owner. */
export const WorkerBookedIMarkedFailed = worker(workerOrders.iMarkedFailed)
/** Owner marked it Failed: the worker can still mark it Done. */
export const WorkerBookedTheyMarkedFailed = worker(
  workerOrders.theyMarkedFailed,
)
/** Booked worker asked to move the booking and waits. */
export const WorkerBookedRescheduleByMe = worker(workerOrders.rescheduleByMe)
/** Owner wants to move the booking: pick a time or keep it. */
export const WorkerBookedRescheduleByThem = worker(
  workerOrders.rescheduleByThem,
)
/** Booked worker asked to cancel and waits for the owner. */
export const WorkerBookedCancelByMe = worker(workerOrders.cancelByMe)
/** Owner asked to cancel: accept or keep the booking. */
export const WorkerBookedCancelByThem = worker(workerOrders.cancelByThem)
/** Conflict: the worker marked Done, the owner marked Failed. */
export const WorkerConflictIMarkedDone = worker(workerOrders.conflictDone)
/** Conflict: the worker marked Failed, the owner marked Done. */
export const WorkerConflictIMarkedFailed = worker(workerOrders.conflictFailed)
/** Finished job, worker side: the record, reviews and receipt. */
export const WorkerCompleted = worker(workerOrders.completed)
/** A cancel request was accepted: booking cancelled, browse other tasks. */
export const WorkerBookingCancelled = worker(workerOrders.cancelled)
/** Both sides marked Failed: the booking did not go ahead. */
export const WorkerBookingFailed = worker(workerOrders.failed)

// Worker not on the booking
/** Worker who has not quoted on an open task: send a quote. */
export const WorkerOpenNotQuoted = view({
  viewer: 'worker',
  task: storyTaskDetail({ quotes: quotes(null, QuoteStatus.Pending) }),
})
/** Worker whose quote is pending: their price against the budget. */
export const WorkerOpenQuoted = view({ viewer: 'worker', task: openTask })
/** Worker whose quote was declined on a task still open: they can quote again. */
export const WorkerOpenDeclined = view({
  viewer: 'worker',
  task: storyTaskDetail({
    quotes: quotes(QuoteStatus.Declined, QuoteStatus.Pending),
  }),
})
/** Worker declined, and the task went to someone else. */
export const WorkerAwardedDeclined = view({
  viewer: 'worker',
  task: storyTaskDetail({
    status: TaskStatus.Awarded,
    quotes: quotes(QuoteStatus.Declined, QuoteStatus.Accepted),
  }),
})
/** Worker not selected: the customer chose another worker. */
export const WorkerNotSelected = view({
  viewer: 'worker',
  task: storyTaskDetail({
    status: TaskStatus.Awarded,
    quotes: quotes(QuoteStatus.NotSelected, QuoteStatus.Accepted),
  }),
})

// Everyone else
/** Signed in without a worker profile: become a worker to quote. */
export const CustomerOpen = view({ viewer: 'nonWorker', task: openTask })
/** Signed out on an open task: sign in as a worker to quote. */
export const GuestOpen = view({ viewer: 'visitor', task: openTask })
/** Anyone not on the booking, task awarded: read-only. */
export const VisitorAwarded = view({ viewer: 'visitor', task: bookedTask })
/** Anyone except the owner, task cancelled: no longer active. */
export const VisitorCancelled = view({
  viewer: 'visitor',
  task: cancelledTask,
})

// Frozen by a suspension (BE-108): the summary reads the same, without the
// actions the API would refuse, the auto-Done date or the lapse note.

const workerSuspended = {
  role: OrderPartyRole.Worker,
  name: 'Jordan Lee',
  canReopen: true,
}
const customerSuspended = {
  role: OrderPartyRole.Customer,
  name: 'Alex Chen',
  canReopen: false,
}

/** Owner marked it Done, worker suspended: no auto-Done date, no switch to Failed. */
export const OwnerFrozenIMarkedDone: Story = {
  ...owner({
    ...ownerOrders.iMarkedDone,
    counterpartySuspension: workerSuspended,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Waiting for Jordan Lee.')
    await expect(canvas.queryByText(/completes automatically/)).toBeNull()
    await expect(
      canvas.queryByRole('button', { name: 'Something went wrong?' }),
    ).toBeNull()
  },
}

/** The owner marked it Done, the worker's customer suspended: no slide, no date. */
export const WorkerFrozenTheyMarkedDone: Story = {
  ...worker({
    ...workerOrders.theyMarkedDone,
    counterpartySuspension: customerSuspended,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(
      'You can mark it Done too once the booking is no longer on hold.',
    )
    await expect(canvas.queryByText(/completes automatically/)).toBeNull()
    await expect(canvas.queryByText('Slide to mark Done')).toBeNull()
  },
}

/** The worker asked to cancel, then was suspended: no answer buttons, no lapse note. */
export const OwnerFrozenCancelByThem: Story = {
  ...owner({
    ...ownerOrders.cancelByThem,
    counterpartySuspension: workerSuspended,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Jordan Lee asked to cancel' })
    await expect(
      canvas.queryByRole('button', { name: 'Accept cancellation' }),
    ).toBeNull()
    await expect(
      canvas.queryByRole('button', { name: 'Keep booking' }),
    ).toBeNull()
    await expect(canvas.queryByText(/the request lapses/)).toBeNull()
  },
}

/** Booked before the start, worker suspended: Message stays; no Reschedule or Cancel booking. */
export const OwnerFrozenBeforeStart: Story = {
  ...owner({
    ...ownerOrders.beforeStart,
    counterpartySuspension: workerSuspended,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Worker booked' })
    await canvas.findByRole('link', { name: /Message/ })
    await expect(
      canvas.queryByRole('button', { name: 'Reschedule' }),
    ).toBeNull()
    await expect(
      canvas.queryByRole('button', { name: 'Cancel booking' }),
    ).toBeNull()
  },
}
