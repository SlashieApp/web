import {
  getTaskDetailView,
  liveQuoteCount,
} from '@/app/(task)/tasks/[slug]/views/getTaskDetailView'
import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'
import { orderBookedDatetime } from '@/utils/orderHelpers'
import { budgetToPence, formatGbpMajor, priceToPence } from '@/utils/price'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

/** A row's status: Booked / In progress, then Open, then Completed. */
export const MY_TASK_SECTION_ORDER = ['booked', 'open', 'completed'] as const

export type MyTaskSectionId = (typeof MY_TASK_SECTION_ORDER)[number]

/** Groups on the page: anything waiting on you first, then by status. */
export const MY_TASK_GROUP_ORDER = [
  'needsYou',
  ...MY_TASK_SECTION_ORDER,
] as const

export type MyTaskGroupId = (typeof MY_TASK_GROUP_ORDER)[number]

/** What a row asks of you now; it files the row under Needs you. */
export type MyTaskAsk =
  | 'compareQuotes'
  | 'answerReschedule'
  | 'answerCancel'
  | 'markDone'
  | 'confirmDone'
  | 'answerFailed'
  | 'conflict'

/** Task detail's views that wait on this viewer, and the ask each makes. */
const ASK_BY_VIEW: Partial<Record<TaskDetailViewName, MyTaskAsk>> = {
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

export type MyTaskRole = 'hosted' | 'quoted'

export type MyTaskSortBucket = 'overdue' | 'upcoming' | 'flex' | 'past'

export type MyTaskTiming =
  | { kind: 'overdue' }
  /** `time` (HH:MM) when the task has an exact time. */
  | { kind: 'today'; time?: string }
  | { kind: 'tomorrow'; time?: string }
  | { kind: 'flexible' }
  | { kind: 'before'; date: string }
  | { kind: 'scheduled'; at: string }

export type MyTaskQuoteSource = {
  id: string
  workerUserId: string
  status: string
  createdAt?: unknown
  price?: { amount: number } | null
  worker?: {
    profile?: { name?: string | null } | null
  } | null
}

export type MyTaskSource = {
  id: string
  title: string
  description?: string | null
  categories?: readonly string[] | null
  status: string
  images?: readonly string[] | null
  completedAt?: unknown
  confirmedAt?: unknown
  datetime?: {
    date?: string | null
    time?: string | null
    type: string
  } | null
  location?: { name?: string | null; address?: string | null } | null
  budget?: { amount: number } | null
  poster?: {
    id: string
    profile?: { name?: string | null } | null
  } | null
  quotes?: readonly MyTaskQuoteSource[] | null
}

export type MyTaskSentQuote = {
  task: MyTaskSource
  quote: MyTaskQuoteSource
}

export type MyTaskOrderSource = {
  taskId: string
  customerUserId: string
  workerUserId: string
  status: string
  /** Booked start (accepted or rescheduled slot); dates booked rows. */
  bookedStart?: unknown
  closedAt?: unknown
  /** The price both sides agreed (major units); what booked rows show. */
  agreedPrice?: { amount: number } | null
  myCloseAction?: { kind: string } | null
  counterpartyCloseAction?: { kind: string } | null
  pendingRequest?: { kind: string; requestedByUserId: string } | null
}

export type MyTaskHubRow = {
  id: string
  title: string
  description: string
  location: string
  priceLabel: string
  /** The task's categories (BE-79), used by `filter.category` (matches any). */
  categories: string[]
  /** Task poster's name, for quoted rows ("Hosted by …"). */
  ownerName: string | null
  thumbnailSrc?: string
  roles: MyTaskRole[]
  section: MyTaskSectionId
  timing: MyTaskTiming
  quoteCount: number
  /** The one accepted worker on a hosted task. Never a multi-worker list. */
  acceptedWorkerName: string | null
  /** My quote lost: someone else got the job. */
  notSelected: boolean
  /** What it asks of you now (from task detail's view); files it under Needs you. */
  ask: MyTaskAsk | null
  /** Live quotes from others on your open task ("3 quotes to compare"). */
  liveQuoteCount: number
  /** The other side of the job, for asks ("Alex asked to reschedule"). */
  counterpartyName: string | null
}

export type MyTaskHubSection = {
  id: MyTaskGroupId
  rows: MyTaskHubRow[]
}

const BOOKED_TASK = new Set(['AWARDED', 'OFFER_ACCEPTED'])

/** Task statuses filed under Completed before an order is considered. */
export const HUB_COMPLETED_TASK_STATUSES = ['CANCELLED'] as const

/**
 * Order statuses filed under Completed: mutual Done (or 7-day auto-Done),
 * and cancelled bookings. A cancelled order leaves its task AWARDED, so the
 * order decides.
 */
export const HUB_DONE_ORDER_STATUSES = ['COMPLETED', 'CANCELLED'] as const

const COMPLETED_TASK = new Set<string>(HUB_COMPLETED_TASK_STATUSES)

const DONE_ORDER = new Set<string>(HUB_DONE_ORDER_STATUSES)

const BUCKET_RANK: Record<MyTaskSortBucket, number> = {
  overdue: 0,
  upcoming: 1,
  flex: 2,
  past: 3,
}

export function normHubStatus(status: string): string {
  return status
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
}

function norm(status: string): string {
  return normHubStatus(status)
}

export function isHubCompletedTaskStatus(
  status: string | null | undefined,
): boolean {
  if (!status) return false
  return COMPLETED_TASK.has(norm(status))
}

export function isHubDoneOrderStatus(
  status: string | null | undefined,
): boolean {
  if (!status) return false
  return DONE_ORDER.has(norm(status))
}

function timeOf(value: unknown): number {
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value).getTime()
    return Number.isNaN(parsed) ? 0 : parsed
  }
  if (value instanceof Date) {
    const parsed = value.getTime()
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** Exact `QuoteStatus.Accepted`: `NOT_SELECTED` means someone else got the job. */
export function isAwardedQuoteStatus(status: string): boolean {
  return norm(status) === 'ACCEPTED'
}

function isPendingQuoteStatus(status: string): boolean {
  return norm(status) === 'PENDING'
}

function quoteRank(status: string): number {
  if (isAwardedQuoteStatus(status)) return 0
  if (isPendingQuoteStatus(status)) return 1
  return 2
}

function preferQuote(
  a: MyTaskQuoteSource,
  b: MyTaskQuoteSource,
): MyTaskQuoteSource {
  const rank = quoteRank(a.status) - quoteRank(b.status)
  if (rank !== 0) return rank < 0 ? a : b
  return timeOf(a.createdAt) >= timeOf(b.createdAt) ? a : b
}

type SchedulePoint = {
  bucket: Exclude<MyTaskSortBucket, 'past'>
  at: number
  parsed: Date | null
  type: string
}

function schedulePoint(
  datetime: MyTaskSource['datetime'],
  now: Date,
): SchedulePoint {
  if (!datetime) {
    return {
      bucket: 'flex',
      at: Number.MAX_SAFE_INTEGER,
      parsed: null,
      type: 'FLEXIBLE',
    }
  }
  const type = norm(datetime.type)
  if (type === 'FLEXIBLE' || type === 'FLEX') {
    return {
      bucket: 'flex',
      at: Number.MAX_SAFE_INTEGER,
      parsed: null,
      type,
    }
  }
  const date = datetime.date?.trim()
  if (!date || (type !== 'EXACT' && type !== 'BEFORE')) {
    return {
      bucket: 'flex',
      at: Number.MAX_SAFE_INTEGER,
      parsed: null,
      type,
    }
  }
  const time = type === 'BEFORE' ? '23:59:59' : datetime.time?.trim() || '00:00'
  const parsed = new Date(`${date}T${time}`)
  if (Number.isNaN(parsed.getTime())) {
    return {
      bucket: 'flex',
      at: Number.MAX_SAFE_INTEGER,
      parsed: null,
      type,
    }
  }
  const today = startOfLocalDay(now)
  if (startOfLocalDay(parsed) < today) {
    return { bucket: 'overdue', at: parsed.getTime(), parsed, type }
  }
  return { bucket: 'upcoming', at: parsed.getTime(), parsed, type }
}

function timingFor(
  datetime: MyTaskSource['datetime'],
  point: SchedulePoint,
  now: Date,
): MyTaskTiming {
  if (point.bucket === 'overdue') return { kind: 'overdue' }
  if (point.bucket === 'flex' || !point.parsed) return { kind: 'flexible' }
  if (point.type === 'BEFORE') {
    return { kind: 'before', date: datetime?.date?.trim() || '' }
  }
  const day = startOfLocalDay(point.parsed)
  const today = startOfLocalDay(now)
  const dayMs = 24 * 60 * 60 * 1000
  const time = datetime?.time?.trim()
    ? `${String(point.parsed.getHours()).padStart(2, '0')}:${String(point.parsed.getMinutes()).padStart(2, '0')}`
    : undefined
  if (day === today) return { kind: 'today', time }
  if (day === today + dayMs) return { kind: 'tomorrow', time }
  return { kind: 'scheduled', at: point.parsed.toISOString() }
}

function completedMs(
  task: MyTaskSource,
  order: MyTaskOrderSource | null,
): number {
  if (order) {
    const fromOrder = timeOf(order.closedAt)
    if (fromOrder) return fromOrder
  }
  return timeOf(task.completedAt) || timeOf(task.confirmedAt) || 0
}

function sectionFor(input: {
  hosted: boolean
  taskStatus: string
  myQuoteStatus: string | null
  someoneElseAwarded: boolean
  orderStatus: string | null
}): MyTaskSectionId {
  const taskStatus = norm(input.taskStatus)
  const quoteStatus = input.myQuoteStatus ? norm(input.myQuoteStatus) : null
  const orderStatus = input.orderStatus ? norm(input.orderStatus) : null
  const taskOpen = taskStatus === 'OPEN' || taskStatus === 'DRAFT'
  const myAwarded = quoteStatus != null && isAwardedQuoteStatus(quoteStatus)
  const myPending = quoteStatus === 'PENDING'

  if (COMPLETED_TASK.has(taskStatus)) return 'completed'
  if (orderStatus && DONE_ORDER.has(orderStatus)) return 'completed'

  // Live bookings and CONFLICT (still needs both parties) stay Booked.
  const orderOpen = orderStatus != null && !DONE_ORDER.has(orderStatus)
  const hostedBooked =
    input.hosted &&
    (BOOKED_TASK.has(taskStatus) || input.someoneElseAwarded || orderOpen)
  const workerBooked = myAwarded || (!input.hosted && orderOpen)
  if (hostedBooked || workerBooked) return 'booked'

  if (input.hosted && taskOpen) return 'open'
  if (myPending && taskOpen && !input.someoneElseAwarded) return 'open'

  return 'completed'
}

function priceLabel(
  task: MyTaskSource,
  myQuote: MyTaskQuoteSource | null,
  order: MyTaskOrderSource | null,
): string {
  // Booked work shows what both sides agreed, not the original budget.
  const agreed = priceToPence(order?.agreedPrice)
  if (agreed != null && agreed > 0) return formatGbpMajor(agreed / 100)
  const budget = budgetToPence(task.budget)
  if (budget != null && budget > 0) return formatGbpMajor(budget / 100)
  const quote = priceToPence(myQuote?.price)
  if (quote != null && quote > 0) return formatGbpMajor(quote / 100)
  return ''
}

function acceptedWorkerName(
  quotes: readonly MyTaskQuoteSource[] | null | undefined,
  userId: string,
): string | null {
  const awarded = (quotes ?? []).filter((quote) =>
    isAwardedQuoteStatus(quote.status),
  )
  const worker = awarded.find((quote) => quote.workerUserId !== userId)
  return worker?.worker?.profile?.name?.trim() || null
}

type Accumulator = {
  task: MyTaskSource
  hosted: boolean
  myQuote: MyTaskQuoteSource | null
}

function orderForTask(
  orders: readonly MyTaskOrderSource[],
  taskId: string,
  userId: string,
  hosted: boolean,
): MyTaskOrderSource | null {
  const related = orders.filter((order) => order.taskId === taskId)
  if (hosted) {
    return (
      related.find((order) => order.customerUserId === userId) ??
      related.find((order) => order.workerUserId === userId) ??
      null
    )
  }
  return related.find((order) => order.workerUserId === userId) ?? null
}

/** What this row waits on you for, from the view task detail would show. */
function askFor(
  task: MyTaskSource,
  hosted: boolean,
  order: MyTaskOrderSource | null,
  userId: string,
  now: Date,
): MyTaskAsk | null {
  const view = getTaskDetailView(
    {
      status: task.status,
      posterId: hosted ? userId : (task.poster?.id ?? null),
      // Your own quote on your own task is nothing to compare.
      quotes: (task.quotes ?? []).filter(
        (quote) => !hosted || quote.workerUserId !== userId,
      ),
    },
    order ? { ...order, bookedStart: order.bookedStart } : null,
    { userId, hasWorkerProfile: true },
    now,
  )
  return ASK_BY_VIEW[view] ?? null
}

/**
 * Merge hosted tasks and sent quotes into Needs you (anything waiting on
 * you, from task detail's views) → Booked / In progress → Open → Completed.
 * Within a group: overdue, then soonest upcoming, then flexible, then
 * completed (newest completion first).
 */
export function buildMyTasksHub(input: {
  posted: readonly MyTaskSource[]
  sentQuotes: readonly MyTaskSentQuote[]
  orders: readonly MyTaskOrderSource[]
  userId: string | null | undefined
  now?: Date
}): MyTaskHubSection[] {
  const userId = input.userId?.trim()
  if (!userId) return []

  const now = input.now ?? new Date()
  const byId = new Map<string, Accumulator>()

  for (const task of input.posted) {
    const mine = (task.quotes ?? [])
      .filter((quote) => quote.workerUserId === userId)
      .reduce<MyTaskQuoteSource | null>(
        (best, quote) => (best ? preferQuote(best, quote) : quote),
        null,
      )
    byId.set(task.id, { task, hosted: true, myQuote: mine })
  }

  for (const sent of input.sentQuotes) {
    const existing = byId.get(sent.task.id)
    if (!existing) {
      byId.set(sent.task.id, {
        task: sent.task,
        hosted: false,
        myQuote: sent.quote,
      })
      continue
    }
    existing.myQuote = existing.myQuote
      ? preferQuote(existing.myQuote, sent.quote)
      : sent.quote
  }

  const sortable: Array<
    MyTaskHubRow & { bucket: MyTaskSortBucket; at: number; completed: number }
  > = []

  for (const entry of byId.values()) {
    const { task, hosted, myQuote } = entry
    const someoneElseAwarded = (task.quotes ?? []).some(
      (quote) =>
        quote.workerUserId !== userId && isAwardedQuoteStatus(quote.status),
    )
    const order = orderForTask(input.orders, task.id, userId, hosted)
    const section = sectionFor({
      hosted,
      taskStatus: task.status,
      myQuoteStatus: myQuote?.status ?? null,
      someoneElseAwarded,
      orderStatus: order?.status ?? null,
    })
    // A booked row runs on the booking, not the poster's original timing.
    const datetime =
      section === 'booked' && order?.bookedStart
        ? orderBookedDatetime({ bookedStart: order.bookedStart })
        : task.datetime
    const point = schedulePoint(datetime, now)
    const bucket: MyTaskSortBucket =
      section === 'completed' ? 'past' : point.bucket
    const roles: MyTaskRole[] = []
    if (hosted) roles.push('hosted')
    if (myQuote) roles.push('quoted')

    sortable.push({
      id: task.id,
      title: task.title,
      description: task.description?.trim() || '',
      location: taskPublicLocationLabel(task),
      priceLabel: priceLabel(task, myQuote, order),
      categories: (task.categories ?? []).map((c) => c.trim()).filter(Boolean),
      ownerName: task.poster?.profile?.name?.trim() || null,
      thumbnailSrc: task.images?.[0],
      roles,
      section,
      timing: timingFor(datetime, point, now),
      quoteCount: hosted ? (task.quotes?.length ?? 0) : 0,
      acceptedWorkerName: hosted
        ? acceptedWorkerName(task.quotes, userId)
        : null,
      notSelected:
        !hosted && myQuote != null && norm(myQuote.status) === 'NOT_SELECTED',
      ask:
        section === 'completed'
          ? null
          : askFor(task, hosted, order, userId, now),
      liveQuoteCount: hosted
        ? liveQuoteCount(
            (task.quotes ?? []).filter(
              (quote) => quote.workerUserId !== userId,
            ),
          )
        : 0,
      counterpartyName: hosted
        ? acceptedWorkerName(task.quotes, userId)
        : task.poster?.profile?.name?.trim() || null,
      bucket,
      at: point.at,
      completed: completedMs(task, order),
    })
  }

  sortable.sort((a, b) => {
    const rank = BUCKET_RANK[a.bucket] - BUCKET_RANK[b.bucket]
    if (rank !== 0) return rank
    if (a.bucket === 'past') {
      if (a.completed !== b.completed) return b.completed - a.completed
    } else if (a.bucket !== 'flex' && a.at !== b.at) {
      return a.at - b.at
    }
    return a.title.localeCompare(b.title)
  })

  return MY_TASK_GROUP_ORDER.flatMap((id) => {
    const rows = sortable
      .filter((row) =>
        id === 'needsYou' ? row.ask != null : !row.ask && row.section === id,
      )
      .map(({ bucket: _bucket, at: _at, completed: _completed, ...row }) => row)
    return rows.length > 0 ? [{ id, rows }] : []
  })
}
