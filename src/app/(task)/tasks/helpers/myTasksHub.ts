import { taskCategoryDisplayLabel } from '@/app/(task)/helpers/taskCategories'
import { budgetToPence, formatGbpMajor, priceToPence } from '@/utils/price'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

export const MY_TASK_SECTION_ORDER = ['open', 'booked', 'completed'] as const

export type MyTaskSectionId = (typeof MY_TASK_SECTION_ORDER)[number]

export type MyTaskRole = 'hosted' | 'quoted'

export type MyTaskSortBucket = 'overdue' | 'upcoming' | 'flex' | 'past'

export type MyTaskTiming =
  | { kind: 'overdue' }
  | { kind: 'today' }
  | { kind: 'tomorrow' }
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
  category?: string | null
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
  workCompletedAt?: unknown
  closedAt?: unknown
  workerPaymentAcknowledgedAt?: unknown
}

export type MyTaskHubRow = {
  id: string
  title: string
  description: string
  location: string
  priceLabel: string
  categoryLabel: string | null
  thumbnailSrc?: string
  roles: MyTaskRole[]
  section: MyTaskSectionId
  timing: MyTaskTiming
  quoteCount: number
  /** The one accepted worker on a hosted task. Never a multi-worker list. */
  acceptedWorkerName: string | null
}

export type MyTaskHubSection = {
  id: MyTaskSectionId
  rows: MyTaskHubRow[]
}

const BOOKED_TASK = new Set([
  'AWARDED',
  'IN_PROGRESS',
  'OFFER_ACCEPTED',
  'QUOTE_ACCEPTED',
])

/**
 * Task statuses filed under Completed before an order is considered.
 * Task detail uses the same set for its no-order fallback.
 */
export const HUB_COMPLETED_TASK_STATUSES = [
  'COMPLETED',
  'CONFIRMED',
  'CANCELLED',
] as const

/**
 * Order statuses filed under Completed.
 * Terminal success is `COMPLETED`. BE-58 renames `CLOSED` → `COMPLETED`;
 * `CLOSED` is not a second terminal status.
 */
export const HUB_DONE_ORDER_STATUSES = [
  'WORK_COMPLETED',
  'PAYMENT_ACKNOWLEDGED',
  'COMPLETED',
] as const

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

export function isAwardedQuoteStatus(status: string): boolean {
  const key = norm(status)
  if (key === 'ACCEPTED' || key === 'AWARDED') return true
  return /ACCEPT|AWARD|SELECT|WIN|APPROVED|CHOSEN/.test(key)
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
  if (day === today) return { kind: 'today' }
  if (day === today + dayMs) return { kind: 'tomorrow' }
  return { kind: 'scheduled', at: point.parsed.toISOString() }
}

function completedMs(
  task: MyTaskSource,
  order: MyTaskOrderSource | null,
): number {
  if (order) {
    const fromOrder =
      timeOf(order.workCompletedAt) ||
      timeOf(order.closedAt) ||
      timeOf(order.workerPaymentAcknowledgedAt)
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
  if (
    orderStatus === 'CANCELLED' &&
    !taskOpen &&
    !BOOKED_TASK.has(taskStatus)
  ) {
    return 'completed'
  }

  const hostedBooked =
    input.hosted &&
    (BOOKED_TASK.has(taskStatus) ||
      input.someoneElseAwarded ||
      orderStatus === 'ACTIVE')
  const workerBooked = myAwarded || (!input.hosted && orderStatus === 'ACTIVE')
  if (hostedBooked || workerBooked) return 'booked'

  if (input.hosted && taskOpen) return 'open'
  if (myPending && taskOpen && !input.someoneElseAwarded) return 'open'

  return 'completed'
}

function priceLabel(
  task: MyTaskSource,
  myQuote: MyTaskQuoteSource | null,
): string {
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

/**
 * Merge hosted tasks and sent quotes into Open → Booked / In progress →
 * Completed. Within a section: overdue, then soonest upcoming, then flexible,
 * then completed (newest completion first).
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
    const point = schedulePoint(task.datetime, now)
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
      priceLabel: priceLabel(task, myQuote),
      categoryLabel: taskCategoryDisplayLabel(task.category),
      thumbnailSrc: task.images?.[0],
      roles,
      section,
      timing: timingFor(task.datetime, point, now),
      quoteCount: hosted ? (task.quotes?.length ?? 0) : 0,
      acceptedWorkerName: hosted
        ? acceptedWorkerName(task.quotes, userId)
        : null,
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

  return MY_TASK_SECTION_ORDER.flatMap((id) => {
    const rows = sortable
      .filter((row) => row.section === id)
      .map(({ bucket: _bucket, at: _at, completed: _completed, ...row }) => row)
    return rows.length > 0 ? [{ id, rows }] : []
  })
}
