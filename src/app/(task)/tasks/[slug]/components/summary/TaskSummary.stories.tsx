import { Box, Grid, Stack } from '@chakra-ui/react'
import {
  Currency,
  OrderCloseKind,
  OrderRequestKind,
  OrderStatus,
  QuoteStatus,
  TaskStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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

export const Loading = view({ viewer: 'owner', task: undefined })

// Owner
export const OwnerOpenNoQuotes = view({
  viewer: 'owner',
  task: storyTaskDetail({ quotes: [] }),
})
export const OwnerOpenQuotes = view({ viewer: 'owner', task: openTask })
export const OwnerBookedBeforeStart = owner(ownerOrders.beforeStart)
export const OwnerBookedReady = owner(ownerOrders.ready)
export const OwnerBookedIMarkedDone = owner(ownerOrders.iMarkedDone)
export const OwnerBookedTheyMarkedDone = owner(ownerOrders.theyMarkedDone)
export const OwnerBookedIMarkedFailed = owner(ownerOrders.iMarkedFailed)
export const OwnerBookedTheyMarkedFailed = owner(ownerOrders.theyMarkedFailed)
export const OwnerBookedRescheduleByMe = owner(ownerOrders.rescheduleByMe)
export const OwnerBookedRescheduleByThem = owner(ownerOrders.rescheduleByThem)
export const OwnerBookedCancelByMe = owner(ownerOrders.cancelByMe)
export const OwnerBookedCancelByThem = owner(ownerOrders.cancelByThem)
export const OwnerConflictIMarkedDone = owner(ownerOrders.conflictDone)
export const OwnerConflictIMarkedFailed = owner(ownerOrders.conflictFailed)
export const OwnerCompleted = owner(ownerOrders.completed)
export const OwnerBookingCancelled = owner(ownerOrders.cancelled)
export const OwnerBookingFailed = owner(ownerOrders.failed)
export const OwnerCancelled = view({ viewer: 'owner', task: cancelledTask })

// Booked worker
export const WorkerBookedBeforeStart = worker(workerOrders.beforeStart)
export const WorkerBookedReady = worker(workerOrders.ready)
export const WorkerBookedIMarkedDone = worker(workerOrders.iMarkedDone)
export const WorkerBookedTheyMarkedDone = worker(workerOrders.theyMarkedDone)
export const WorkerBookedIMarkedFailed = worker(workerOrders.iMarkedFailed)
export const WorkerBookedTheyMarkedFailed = worker(
  workerOrders.theyMarkedFailed,
)
export const WorkerBookedRescheduleByMe = worker(workerOrders.rescheduleByMe)
export const WorkerBookedRescheduleByThem = worker(
  workerOrders.rescheduleByThem,
)
export const WorkerBookedCancelByMe = worker(workerOrders.cancelByMe)
export const WorkerBookedCancelByThem = worker(workerOrders.cancelByThem)
export const WorkerConflictIMarkedDone = worker(workerOrders.conflictDone)
export const WorkerConflictIMarkedFailed = worker(workerOrders.conflictFailed)
export const WorkerCompleted = worker(workerOrders.completed)
export const WorkerBookingCancelled = worker(workerOrders.cancelled)
export const WorkerBookingFailed = worker(workerOrders.failed)

// Worker not on the booking
export const WorkerOpenNotQuoted = view({
  viewer: 'worker',
  task: storyTaskDetail({ quotes: quotes(null, QuoteStatus.Pending) }),
})
export const WorkerOpenQuoted = view({ viewer: 'worker', task: openTask })
export const WorkerOpenDeclined = view({
  viewer: 'worker',
  task: storyTaskDetail({
    quotes: quotes(QuoteStatus.Declined, QuoteStatus.Pending),
  }),
})
export const WorkerAwardedDeclined = view({
  viewer: 'worker',
  task: storyTaskDetail({
    status: TaskStatus.Awarded,
    quotes: quotes(QuoteStatus.Declined, QuoteStatus.Accepted),
  }),
})
export const WorkerNotSelected = view({
  viewer: 'worker',
  task: storyTaskDetail({
    status: TaskStatus.Awarded,
    quotes: quotes(QuoteStatus.NotSelected, QuoteStatus.Accepted),
  }),
})

// Everyone else
export const CustomerOpen = view({ viewer: 'nonWorker', task: openTask })
export const GuestOpen = view({ viewer: 'visitor', task: openTask })
export const VisitorAwarded = view({ viewer: 'visitor', task: bookedTask })
export const VisitorCancelled = view({
  viewer: 'visitor',
  task: cancelledTask,
})
