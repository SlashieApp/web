import {
  getTaskDetailView,
  liveQuoteCount,
} from '@/app/(task)/tasks/[slug]/views/getTaskDetailView'
import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'
import { currentTaskOrder, orderBookedDatetime } from '@/utils/orderHelpers'
import { formatGbpMajor, priceToPence } from '@/utils/price'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

/** The hub's sections, in page order (like Uber's Activity screen). */
export const MY_TASK_SECTIONS = ['upcoming', 'open', 'past'] as const

export type MyTaskSectionId = (typeof MY_TASK_SECTIONS)[number]

/** The one button a row shows; a row without one shows the ⋮ menu. */
export type MyTaskAction =
  | 'compareQuotes'
  | 'answerReschedule'
  | 'answerCancel'
  | 'markDone'
  | 'confirmDone'
  | 'answerFailed'
  | 'conflict'
  | 'review'

/** Task detail's views that wait on this viewer, and the button for each. */
export const ACTION_BY_VIEW: Partial<Record<TaskDetailViewName, MyTaskAction>> =
  {
    'owner.open.quotes': 'compareQuotes',
    'owner.booked.rescheduleByThem': 'answerReschedule',
    'worker.booked.rescheduleByThem': 'answerReschedule',
    'owner.booked.cancelByThem': 'answerCancel',
    'worker.booked.cancelByThem': 'answerCancel',
    'owner.booked.ready': 'markDone',
    'worker.booked.ready': 'markDone',
    'owner.booked.theyMarkedDone': 'confirmDone',
    'worker.booked.theyMarkedDone': 'confirmDone',
    'owner.booked.theyMarkedFailed': 'answerFailed',
    'worker.booked.theyMarkedFailed': 'answerFailed',
    'owner.conflict.iMarkedDone': 'conflict',
    'owner.conflict.iMarkedFailed': 'conflict',
    'worker.conflict.iMarkedDone': 'conflict',
    'worker.conflict.iMarkedFailed': 'conflict',
  }

/** You posted the task, or you quoted on it. */
export type MyTaskRole = 'hosted' | 'quoted'

/** When an Upcoming job is on: its day heading and its date and time. */
export type MyTaskWhen =
  | { day: 'flexible' }
  | {
      /** Before today, today, tomorrow, later this week, later, or a Before date. */
      day: 'overdue' | 'today' | 'tomorrow' | 'weekday' | 'date' | 'before'
      /** The booked start (else the task's own date and time), ISO. */
      at: string
      /** A time of day is set (a Before date has none). */
      time: boolean
    }

/** How a Past task ended for this viewer. */
export type MyTaskOutcome =
  | 'completed'
  | 'cancelled'
  /** Both sides marked it Failed: the booking didn't go ahead. */
  | 'failed'
  /** Your quote is still pending while someone else is booked (BE-113). */
  | 'bookedByOther'
  /** Your quote is still pending, and someone else's job is complete (BE-113). */
  | 'taskCompleted'
  /** Your quote is still pending; the booking ended and the task isn't reopened (BE-116). */
  | 'otherBookingEnded'
  /** Anything else that is over, such as a quote that closed. */
  | 'closed'

export type MyTaskQuoteSource = {
  id: string
  workerUserId: string
  status: string
  createdAt?: unknown
  price?: { amount: number } | null
}

export type MyTaskSource = {
  id: string
  title: string
  /** When it was posted; Past falls back to it to sort. */
  createdAt?: unknown
  categories?: readonly string[] | null
  status: string
  images?: readonly string[] | null
  datetime?: {
    date?: string | null
    time?: string | null
    type: string
  } | null
  location?: { name?: string | null; address?: string | null } | null
  budget?: { amount: number } | null
  poster?: { id: string } | null
  quotes?: readonly MyTaskQuoteSource[] | null
  /**
   * `Task.bookingStatus` (BE-113), on the quotes you sent: your PENDING quote
   * stays PENDING while someone else is booked, and this says so.
   */
  bookingStatus?: string | null
  /** Set while it is suspended (BE-108): still listed, but frozen. */
  suspension?: { bySlashie: boolean; posterSuspended: boolean } | null
}

export type MyTaskSentQuote = {
  task: MyTaskSource
  quote: MyTaskQuoteSource
}

export type MyTaskOrderSource = {
  id: string
  taskId: string
  customerUserId: string
  workerUserId: string
  status: string
  /** Booked start (accepted or rescheduled slot); Upcoming runs on it. */
  bookedStart: unknown
  /** When the order reached COMPLETED or CANCELLED. */
  closedAt?: unknown
  /** When it was booked: a reopened task keeps older, cancelled orders. */
  createdAt?: unknown
  /** The price both sides agreed (major units). */
  agreedPrice?: { amount: number } | null
  myCloseAction?: { kind: string } | null
  counterpartyCloseAction?: { kind: string } | null
  pendingRequest?: { kind: string; requestedByUserId: string } | null
  /** `canSubmit`: the order is COMPLETED and this viewer hasn't reviewed it. */
  reviewState?: { canSubmit: boolean } | null
  /** The other party's account is suspended (BE-108): the booking is frozen. */
  counterpartySuspension?: { role: string } | null
}

export type MyTaskHubRow = {
  id: string
  title: string
  /** The area: the task's place name or address. */
  location: string
  /** The agreed price once booked; else your quote (quotes you sent) or the budget. */
  priceLabel: string
  /** The task's categories (BE-79): the role filter, Report and the photo placeholder. */
  categories: string[]
  /** The task's first photo. */
  thumbnailSrc?: string
  roles: MyTaskRole[]
  section: MyTaskSectionId
  /** Upcoming only: when the job is on (the booking's start). */
  when: MyTaskWhen | null
  /** Live (pending) quotes from others on your task ("3 quotes"). */
  liveQuoteCount: number
  /** Past only: how it ended for you. */
  outcome: MyTaskOutcome | null
  /** Past only: when the booking closed (ISO). Null when the hub has no end date. */
  endedAt: string | null
  /** The one button; null shows the ⋮ menu. */
  action: MyTaskAction | null
  /** Your order on the task (Review opens its review form). */
  orderId: string | null
  /**
   * The task is suspended (BE-108). It stays in your list, with no button
   * and no Edit task, since the API would refuse them.
   */
  suspended: boolean
}

export type MyTaskHubSection = {
  id: MyTaskSectionId
  rows: MyTaskHubRow[]
}

const DONE_ORDER = new Set(['COMPLETED', 'CANCELLED'])

const DAY_MS = 24 * 60 * 60 * 1000

export function normHubStatus(status: string): string {
  return status
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
}

function timeOf(value: unknown): number {
  if (typeof value !== 'string' && typeof value !== 'number') return 0
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function quoteRank(status: string): number {
  const norm = normHubStatus(status)
  if (norm === 'ACCEPTED') return 0
  if (norm === 'PENDING') return 1
  return 2
}

/** The quote that says most about you: accepted, then pending, then newest. */
function preferQuote(
  a: MyTaskQuoteSource,
  b: MyTaskQuoteSource,
): MyTaskQuoteSource {
  const rank = quoteRank(a.status) - quoteRank(b.status)
  if (rank !== 0) return rank < 0 ? a : b
  return timeOf(a.createdAt) >= timeOf(b.createdAt) ? a : b
}

type Schedule = { at: number; when: MyTaskWhen }

const UNSCHEDULED: Schedule = {
  at: Number.POSITIVE_INFINITY,
  when: { day: 'flexible' },
}

function dayOf(
  at: Date,
  now: Date,
  before: boolean,
): Exclude<MyTaskWhen['day'], 'flexible'> {
  // Rounded, so a daylight-saving day (23 or 25 hours) still counts as one.
  const days = Math.round((startOfLocalDay(at) - startOfLocalDay(now)) / DAY_MS)
  if (days < 0) return 'overdue'
  if (before) return 'before'
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  // "On Wednesday" only while that weekday can't be mistaken for next week's.
  return days < 7 ? 'weekday' : 'date'
}

/** When a task's time falls, for sorting and the Upcoming day label. */
function scheduleOf(datetime: MyTaskSource['datetime'], now: Date): Schedule {
  const type = normHubStatus(datetime?.type ?? '')
  const date = datetime?.date?.trim()
  if (!date || (type !== 'EXACT' && type !== 'BEFORE')) return UNSCHEDULED
  const time = type === 'EXACT' ? datetime?.time?.trim() || '' : ''
  const parsed = new Date(
    `${date}T${type === 'BEFORE' ? '23:59:59' : time || '00:00'}`,
  )
  if (Number.isNaN(parsed.getTime())) return UNSCHEDULED
  return {
    at: parsed.getTime(),
    when: {
      day: dayOf(parsed, now, type === 'BEFORE'),
      at: parsed.toISOString(),
      time: Boolean(time),
    },
  }
}

/**
 * Your current booking on the task, as task detail picks it
 * (`currentTaskOrder`): a reopened task (BE-108) keeps its old, cancelled
 * booking, which isn't the one to show once it is open or booked again.
 */
function orderForTask(
  orders: readonly MyTaskOrderSource[],
  task: MyTaskSource,
  userId: string,
  hosted: boolean,
): MyTaskOrderSource | null {
  const related = orders.filter((order) => order.taskId === task.id)
  const asCustomer = related.filter((order) => order.customerUserId === userId)
  const asWorker = related.filter((order) => order.workerUserId === userId)
  const mine = hosted && asCustomer.length > 0 ? asCustomer : asWorker
  return currentTaskOrder(mine, task.status)
}

type Facts = {
  hosted: boolean
  taskStatus: string
  /** `Task.bookingStatus`, normalised; empty when the list didn't ask. */
  bookingStatus: string
  quoteStatus: string | null
  orderStatus: string | null
  /** Another worker's quote on the task was accepted. */
  someoneElseAwarded: boolean
}

/**
 * Upcoming: booked and not finished (a CONFLICT still needs both sides).
 * Open: your open task, or your pending quote on an open task. Past:
 * everything that ended, including a pending quote on a task someone else
 * booked (BE-113): the task isn't open, so it never reads as Open.
 */
function sectionFor(facts: Facts): MyTaskSectionId {
  const { hosted, taskStatus, quoteStatus, orderStatus } = facts
  if (taskStatus === 'CANCELLED') return 'past'
  if (orderStatus && DONE_ORDER.has(orderStatus)) return 'past'

  const taskOpen = taskStatus === 'OPEN' || taskStatus === 'DRAFT'
  const hostedBooked =
    hosted &&
    (taskStatus === 'AWARDED' ||
      facts.someoneElseAwarded ||
      Boolean(orderStatus))
  const workerBooked =
    quoteStatus === 'ACCEPTED' || (!hosted && Boolean(orderStatus))
  if (hostedBooked || workerBooked) return 'upcoming'

  if (hosted && taskOpen) return 'open'
  if (quoteStatus === 'PENDING' && taskOpen && !facts.someoneElseAwarded) {
    return 'open'
  }
  return 'past'
}

/**
 * In task detail's order: a cancelled task first, then your booking, then a
 * quote of yours that is still PENDING while someone else is booked or done
 * (BE-113), or after the booking ended on a task the owner hasn't reopened
 * (AWARDED with `bookingStatus` NONE, BE-116). Anything else that is over
 * reads as closed, whatever your quote's status was.
 */
function outcomeFor(
  facts: Facts,
  order: MyTaskOrderSource | null,
): MyTaskOutcome {
  if (facts.taskStatus === 'CANCELLED') return 'cancelled'
  if (facts.orderStatus === 'COMPLETED') return 'completed'
  if (facts.orderStatus === 'CANCELLED') {
    const failed = (action?: { kind: string } | null) =>
      normHubStatus(action?.kind ?? '') === 'FAILED'
    return failed(order?.myCloseAction) &&
      failed(order?.counterpartyCloseAction)
      ? 'failed'
      : 'cancelled'
  }
  if (!facts.hosted && facts.quoteStatus === 'PENDING') {
    if (facts.bookingStatus === 'BOOKED') return 'bookedByOther'
    if (facts.bookingStatus === 'COMPLETED') return 'taskCompleted'
    if (facts.bookingStatus === 'NONE' && facts.taskStatus === 'AWARDED') {
      return 'otherBookingEnded'
    }
  }
  return 'closed'
}

/** The first amount there is: agreed, then your quote (quotes you sent), then the budget. */
function priceLabel(
  task: MyTaskSource,
  hosted: boolean,
  myQuote: MyTaskQuoteSource | null,
  order: MyTaskOrderSource | null,
): string {
  const pence = [
    order?.agreedPrice,
    hosted ? null : myQuote?.price,
    task.budget,
  ]
    .map((price) => priceToPence(price))
    .find((amount) => amount != null && amount > 0)
  return pence ? formatGbpMajor(pence / 100) : ''
}

/**
 * Review on a completed job you can still review; otherwise what task
 * detail's view waits on you for (Past has nothing else to ask). Nothing on
 * a suspended task or a frozen booking (BE-108): the API would refuse it.
 */
function actionFor(input: {
  task: MyTaskSource
  section: MyTaskSectionId
  outcome: MyTaskOutcome | null
  order: MyTaskOrderSource | null
  hosted: boolean
  othersQuotes: readonly MyTaskQuoteSource[]
  userId: string
  now: Date
}): MyTaskAction | null {
  const { task, order, hosted, userId } = input
  if (task.suspension || order?.counterpartySuspension) return null
  if (input.section === 'past') {
    return input.outcome === 'completed' &&
      order?.reviewState?.canSubmit === true
      ? 'review'
      : null
  }
  const view = getTaskDetailView(
    {
      status: task.status,
      bookingStatus: task.bookingStatus ?? '',
      posterId: hosted ? userId : (task.poster?.id ?? null),
      quotes: hosted ? input.othersQuotes : (task.quotes ?? []),
    },
    order,
    { userId, hasWorkerProfile: true },
    input.now,
  )
  return ACTION_BY_VIEW[view] ?? null
}

/** Upcoming and Open: when it happens. Past: when it ended (see `sortMs`). */
type SortableRow = MyTaskHubRow & { sortMs: number }

function compareRows(a: SortableRow, b: SortableRow): number {
  if (a.sortMs !== b.sortMs) {
    // Past newest first; the others soonest first, untimed (flexible) last.
    const soonestFirst = a.sortMs < b.sortMs ? -1 : 1
    return a.section === 'past' ? -soonestFirst : soonestFirst
  }
  return a.title.localeCompare(b.title)
}

/**
 * Your posted tasks and the quotes you sent, one row per task, in three
 * sections: Upcoming (booked, soonest first), Open (waiting for quotes or
 * an answer, soonest first) and Past (ended, newest first by when the
 * booking closed, else when you quoted or posted it). Each row gets the one
 * button task detail's view waits on you for, or Review on a completed job
 * you can still review. All three sections come back, empty or not.
 */
export function buildMyTasksHub(input: {
  posted: readonly MyTaskSource[]
  sentQuotes: readonly MyTaskSentQuote[]
  orders: readonly MyTaskOrderSource[]
  userId: string | null | undefined
  now?: Date
}): MyTaskHubSection[] {
  const userId = input.userId?.trim()
  if (!userId) return MY_TASK_SECTIONS.map((id) => ({ id, rows: [] }))
  const now = input.now ?? new Date()
  const byId = new Map<
    string,
    { task: MyTaskSource; hosted: boolean; myQuote: MyTaskQuoteSource | null }
  >()

  for (const task of input.posted) {
    const myQuote = (task.quotes ?? [])
      .filter((quote) => quote.workerUserId === userId)
      .reduce<MyTaskQuoteSource | null>(
        (best, quote) => (best ? preferQuote(best, quote) : quote),
        null,
      )
    byId.set(task.id, { task, hosted: true, myQuote })
  }
  for (const sent of input.sentQuotes) {
    const existing = byId.get(sent.task.id)
    if (existing) {
      existing.myQuote = existing.myQuote
        ? preferQuote(existing.myQuote, sent.quote)
        : sent.quote
    } else {
      byId.set(sent.task.id, {
        task: sent.task,
        hosted: false,
        myQuote: sent.quote,
      })
    }
  }

  const rows: SortableRow[] = []
  for (const { task, hosted, myQuote } of byId.values()) {
    // Your own quote on your own task is nothing to compare.
    const othersQuotes = (task.quotes ?? []).filter(
      (quote) => quote.workerUserId !== userId,
    )
    const order = orderForTask(input.orders, task, userId, hosted)
    const facts: Facts = {
      hosted,
      taskStatus: normHubStatus(task.status),
      bookingStatus: normHubStatus(task.bookingStatus ?? ''),
      quoteStatus: myQuote ? normHubStatus(myQuote.status) : null,
      orderStatus: order ? normHubStatus(order.status) : null,
      someoneElseAwarded: othersQuotes.some(
        (quote) => normHubStatus(quote.status) === 'ACCEPTED',
      ),
    }
    const section = sectionFor(facts)
    const outcome = section === 'past' ? outcomeFor(facts, order) : null
    // Booked work runs on the booking, not the poster's first preference.
    const schedule = scheduleOf(
      order?.bookedStart
        ? orderBookedDatetime({ bookedStart: order.bookedStart })
        : task.datetime,
      now,
    )
    const closedMs = section === 'past' ? timeOf(order?.closedAt) : 0
    const roles: MyTaskRole[] = []
    if (hosted) roles.push('hosted')
    if (myQuote) roles.push('quoted')

    rows.push({
      id: task.id,
      title: task.title,
      location: taskPublicLocationLabel(task),
      priceLabel: priceLabel(task, hosted, myQuote, order),
      categories: (task.categories ?? []).map((c) => c.trim()).filter(Boolean),
      thumbnailSrc: task.images?.[0],
      roles,
      section,
      when: section === 'upcoming' ? schedule.when : null,
      liveQuoteCount: hosted ? liveQuoteCount(othersQuotes) : 0,
      outcome,
      endedAt: closedMs ? new Date(closedMs).toISOString() : null,
      action: actionFor({
        task,
        section,
        outcome,
        order,
        hosted,
        othersQuotes,
        userId,
        now,
      }),
      orderId: order?.id ?? null,
      suspended: Boolean(task.suspension),
      // Past: no end time in the data means when you quoted, else posted it.
      sortMs:
        section === 'past'
          ? closedMs || timeOf(myQuote?.createdAt) || timeOf(task.createdAt)
          : schedule.at,
    })
  }

  return MY_TASK_SECTIONS.map((id) => ({
    id,
    rows: rows
      .filter((row) => row.section === id)
      .sort(compareRows)
      .map(({ sortMs: _sortMs, ...row }) => row),
  }))
}
