import { taskCategoryDisplayLabel } from '@/app/(task)/helpers/taskCategories'
import {
  appendViewsToStatusLabel,
  taskOwnerViewsLabel,
  taskPublicViewsLabel,
} from '@/app/(task)/helpers/taskViewLabels'
import {
  type OrderItem,
  isOrderClosed,
  orderLocationLabel,
} from '@/utils/orderHelpers'
import { formatBudgetAmount, priceToPence } from '@/utils/price'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { QuoteStatus, TaskTimelineEventType } from '@codegen/schema'
import type { TaskCoreQuery, TaskQuery } from '@codegen/schema'
import { mapTaskStatus } from './mapTaskStatus'

export type TaskCoreRecord = NonNullable<TaskCoreQuery['task']>
export type TaskClientRecord = NonNullable<TaskQuery['task']>

/**
 * The merged task the detail context exposes:
 * - PUBLIC meta server-rendered via TaskCore (fast, auth-free SSR),
 * - viewer-scoped fields + quotes fetched client-side via Task.gql.
 * Until the client query resolves, viewer fields carry their redacted/guest
 * fallbacks (empty orders/timeline, null contact + address).
 */
export type TaskDetailRecord = Omit<TaskCoreRecord, 'location' | 'poster'> & {
  quotes: TaskClientRecord['quotes']
  location: TaskClientRecord['location']
  poster: TaskClientRecord['poster']
  timeline: TaskClientRecord['timeline']
  orders: TaskClientRecord['orders']
}

/**
 * Task creation time, derived from the TASK_CREATED timeline event. Null for
 * viewers whose timeline is empty (public/guest) since the field was removed.
 */
export function taskCreatedAtIso(
  task: Pick<TaskDetailRecord, 'timeline'>,
): string | null {
  return (
    task.timeline.find((e) => e.type === TaskTimelineEventType.TaskCreated)
      ?.timestamp ?? null
  )
}

export type AvailabilityChip = {
  key: string
  monthDay: string
  title: string
  subtitle: string
}

export function formatPoundsFromPence(pricePence: number) {
  return `£${(pricePence / 100).toFixed(0)}`
}

/** Human-readable budget payment method (e.g. cash, card). */
export function formatTaskBudgetPaymentMethodLabel(
  paymentMethod: string,
): string {
  const normalised = paymentMethod.replaceAll('_', ' ').toLowerCase()
  return normalised.charAt(0).toUpperCase() + normalised.slice(1)
}

export type TaskBudgetViewerContext = 'owner' | 'visitor'

export function formatTaskDateTimeType(type: string): string {
  const t = type.trim().toUpperCase()
  if (t === 'EXACT') return 'Exact time'
  if (t === 'BEFORE') return 'Before'
  if (t === 'FLEXIBLE') return 'Flexible'
  return type
}

/**
 * Hero budget line: quote range when prices are visible, else posted budget.
 * Quote `price` is owner-only; visitors only see their own quote amounts.
 */
export function taskBudgetDisplayLine(
  task: TaskDetailRecord,
  viewer: TaskBudgetViewerContext,
  viewerUserId?: string | null,
): string {
  const quotes =
    viewer === 'owner'
      ? task.quotes
      : viewerUserId
        ? task.quotes.filter((q) => q.workerUserId === viewerUserId)
        : []
  if (quotes.length > 0) {
    const prices = quotes
      .map((q) => priceToPence(q.price))
      .filter((price): price is number => price != null)
    if (prices.length === 0) {
      if (task.budget) return formatBudgetAmount(task.budget)
      return 'Open to quotes'
    }
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) return formatPoundsFromPence(min)
    return `${formatPoundsFromPence(min)} — ${formatPoundsFromPence(max)}`
  }
  if (task.budget) return formatBudgetAmount(task.budget)
  return 'Open to quotes'
}

/** Single chip row from nested `datetime` (replaces weekly availability). */
export function buildAvailabilityChips(
  task: TaskDetailRecord,
): AvailabilityChip[] {
  const dt = task.datetime
  if (!dt) return []

  const typeLabel = formatTaskDateTimeType(dt.type)
  const datePart = dt.date?.trim()
  const timePart = dt.time?.trim()

  if (datePart && timePart) {
    const d = new Date(`${datePart}T12:00:00`)
    const monthDay = Number.isNaN(d.getTime())
      ? 'DATE'
      : d
          .toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
          .toUpperCase()
    return [
      {
        key: 'datetime',
        monthDay,
        title: datePart,
        subtitle: `${timePart} · ${typeLabel}`,
      },
    ]
  }
  if (datePart) {
    const d = new Date(`${datePart}T12:00:00`)
    const monthDay = Number.isNaN(d.getTime())
      ? 'DATE'
      : d
          .toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
          .toUpperCase()
    return [
      {
        key: 'datetime-date',
        monthDay,
        title: datePart,
        subtitle: typeLabel,
      },
    ]
  }
  return [
    {
      key: 'datetime-type',
      monthDay: 'WHEN',
      title: typeLabel,
      subtitle: 'Preferred timing',
    },
  ]
}

/** Budget shown on the owner quick-info card (posted budget, not quote range). */
export function taskOwnerPostedBudgetLine(task: TaskDetailRecord): string {
  if (task.budget) return formatBudgetAmount(task.budget)
  return 'Open to quotes'
}

/** Short label for quick info from `datetime`. */
export function taskAvailabilityRangeLabel(task: TaskDetailRecord): string {
  const dt = task.datetime
  if (!dt) return 'Flexible'
  const datePart = dt.date?.trim()
  if (datePart) {
    const d = new Date(`${datePart}T12:00:00`)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { weekday: 'short' })
    }
    return datePart
  }
  return formatTaskDateTimeType(dt.type)
}

export function ownerProInterestLabel(quoteCount: number): string {
  if (quoteCount >= 5) return 'High'
  if (quoteCount >= 2) return 'Medium'
  return 'Low'
}

/** Average hours from task post to each quote (rough engagement signal). */
export function averageHoursToQuotes(task: TaskDetailRecord): number | null {
  if (task.quotes.length === 0) return null
  const createdAt = taskCreatedAtIso(task)
  if (!createdAt) return null
  const t0 = new Date(createdAt).getTime()
  if (Number.isNaN(t0)) return null
  let sum = 0
  let n = 0
  for (const q of task.quotes) {
    const t = new Date(q.createdAt).getTime()
    if (!Number.isNaN(t) && t >= t0) {
      sum += (t - t0) / 36e5
      n += 1
    }
  }
  if (n === 0) return null
  return sum / n
}

export function formatAvgResponseHours(hours: number): string {
  if (hours < 24) return `${Math.max(1, Math.round(hours))}h`
  return `${Math.max(1, Math.round(hours / 24))}d`
}

/**
 * Split a quote message into its body and the "Availability: X" line the
 * quote flow appends — the availability renders as a chip on quote cards.
 */
export function splitQuoteMessageAvailability(
  message: string | null | undefined,
): { body: string | null; availability: string | null } {
  const trimmed = message?.trim()
  if (!trimmed) return { body: null, availability: null }
  const match = trimmed.match(/(?:^|\n)\s*Availability:\s*(.+?)\s*$/i)
  if (!match) return { body: trimmed, availability: null }
  const availability = match[1]?.trim() || null
  const body = trimmed.replace(match[0], '').trim() || null
  return { body, availability }
}

/** Relative “Responded … ago” line for quote cards (from `quote.createdAt`). */
export function formatQuoteRespondedAgo(
  iso: string | null | undefined,
): string | null {
  if (!iso?.trim()) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  const diffMs = Date.now() - t
  if (diffMs < 0) return 'Responded just now'
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Responded just now'
  if (mins < 60) return `Responded ${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `Responded ${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `Responded ${days} day${days === 1 ? '' : 's'} ago`
}

/** Public quote cards: “Posted … ago”. */
export function formatQuotePostedAgo(
  iso: string | null | undefined,
): string | null {
  const responded = formatQuoteRespondedAgo(iso)
  if (!responded) return null
  return responded.replace(/^Responded /, 'Posted ')
}

function parseCoord(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number.parseFloat(value.trim())
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** Task centre for map display from `location`. */
export function taskMapCoordinates(
  task: TaskDetailRecord,
): { lat: number; lng: number } | null {
  const lat = parseCoord(task.location?.lat)
  const lng = parseCoord(task.location?.lng)
  if (lat == null || lng == null) return null
  return { lat, lng }
}

export function taskHasAcceptedQuote(task: TaskDetailRecord): boolean {
  return task.quotes.some((q) => q.status === QuoteStatus.Accepted)
}

/** Exact street address for viewers allowed to see the booked location. */
export function taskDetailShowsExactLocation(input: {
  myOrder?: OrderItem | null
  showFullAddress: boolean
}): boolean {
  if (input.myOrder) return true
  return input.showFullAddress
}

export function taskDetailMapCoordinates(
  task: TaskDetailRecord,
  myOrder?: OrderItem | null,
): { lat: number; lng: number } | null {
  const orderLat = parseCoord(myOrder?.snapshot?.location?.lat)
  const orderLng = parseCoord(myOrder?.snapshot?.location?.lng)
  if (orderLat != null && orderLng != null) {
    return { lat: orderLat, lng: orderLng }
  }
  return taskMapCoordinates(task)
}

export function taskDetailLocationLabel(input: {
  task: TaskDetailRecord
  myOrder?: OrderItem | null
  showExactLocation: boolean
}): string {
  if (input.myOrder) {
    return orderLocationLabel(input.myOrder)
  }
  if (input.showExactLocation) {
    return (
      input.task.location?.address?.trim() ||
      input.task.location?.name?.trim() ||
      taskPublicLocationLabel(input.task) ||
      'Address shared when your quote is accepted'
    )
  }
  return taskPublicLocationLabel(input.task) || 'Approximate area'
}

/** Short label for budget `type` (e.g. badge next to amount). */
export function budgetKindLabel(
  budgetType: string | null | undefined,
): string | null {
  if (!budgetType) return null
  const u = budgetType.trim().toUpperCase().replaceAll(' ', '_')
  if (u === 'ONE_OFF' || u === 'FIXED') return 'Fixed price'
  if (u === 'PER_HOUR') return 'Per hour'
  if (u === 'PER_DAY') return 'Per day'
  return null
}

export function normaliseTaskStatusForBadge(status: string) {
  return status.replaceAll('_', ' ').toUpperCase()
}

export function taskStatusBadgeLabel(status: string) {
  const s = status.toUpperCase()
  if (s === 'OPEN' || s === 'POSTED' || s === 'PUBLISHED') return 'OPEN'
  return normaliseTaskStatusForBadge(status)
}

export function visitorFacingStatusBadge(status: string) {
  const s = status.toUpperCase()
  if (s === 'OPEN' || s === 'POSTED' || s === 'PUBLISHED') return 'New task'
  return taskStatusBadgeLabel(status)
}

export function workerQuoteAvatarLabel(workerUserId: string) {
  const alnum = workerUserId.replace(/[^a-zA-Z0-9]/g, '')
  if (alnum.length >= 2) return alnum.slice(0, 2)
  if (alnum.length === 1) return `${alnum}P`
  return 'PR'
}

export function isTaskDetailListingClosed(
  task: TaskDetailRecord,
  myOrder?: { status: string } | null,
): boolean {
  if (myOrder && isOrderClosed(myOrder.status)) return true
  return mapTaskStatus(task.status) === 'CLOSED'
}

export function centerColumnStatusLabel(
  task: TaskDetailRecord,
  isOwner: boolean,
  myOrder?: { status: string } | null,
): string {
  const taskStatus = mapTaskStatus(task.status)
  const closed =
    isTaskDetailListingClosed(task, myOrder) || taskStatus === 'CLOSED'
  if (isOwner) {
    const n = task.quotes.length
    const quotePart = n ? `${n} quote${n === 1 ? '' : 's'}` : null
    if (closed) {
      return quotePart ? `CLOSED · ${quotePart}` : 'CLOSED'
    }
    const base =
      taskStatus === 'AWARDED'
        ? 'AWARDED'
        : taskStatus === 'OPEN'
          ? 'OPEN'
          : 'CLOSED'
    if (quotePart) return `${base} · ${quotePart}`
    return appendViewsToStatusLabel(base, taskOwnerViewsLabel(task))
  }
  if (closed) return 'Closed'
  if (taskStatus === 'AWARDED') return 'In progress'
  if (taskStatus === 'OPEN') {
    return appendViewsToStatusLabel(
      'New task',
      taskPublicViewsLabel(task.views),
    )
  }
  return 'Closed'
}

const CATEGORY_KEYWORDS: ReadonlyArray<[RegExp, string]> = [
  [/deliver|courier|parcel/i, 'Delivery'],
  [/handyman|shelf|fix|mount|drill|plaster|wall/i, 'Handyman'],
  [/clean|hoover|tidy|vacuum/i, 'Cleaning'],
  [/mov(e|ing)|furniture/i, 'Moving'],
  [/tech|computer|wifi|setup|router/i, 'Tech setup'],
]

/** Category chip: prefer API `task.category`, then title/description heuristics. */
export function taskCategoryLabel(task: TaskDetailRecord): string | null {
  const fromApi = taskCategoryDisplayLabel(task.category)
  if (fromApi) return fromApi
  const t = `${task.title} ${task.description}`
  for (const [re, label] of CATEGORY_KEYWORDS) {
    if (re.test(t)) return label
  }
  return null
}

/** Short date label for hero meta: "Today" when the task date is today (local). */
export function taskPrimaryCalendarLabel(task: TaskDetailRecord): string {
  const datePart = task.datetime?.date?.trim()
  if (!datePart) return 'Flexible'
  const d = new Date(`${datePart}T12:00:00`)
  if (Number.isNaN(d.getTime())) return 'Flexible'
  const today = new Date()
  if (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  ) {
    return 'Today'
  }
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** Time / duration hint from `datetime.time` when present. */
export function taskDurationEstimateLabel(
  task: TaskDetailRecord,
): string | null {
  const timePart = task.datetime?.time?.trim()
  if (!timePart) return null
  return timePart
}

/** Visitor-facing urgency line (heuristic + `datetime.type`). */
export function taskUrgencyDisplayLabel(task: TaskDetailRecord): string {
  const text = `${task.title} ${task.description}`.toLowerCase()
  if (/\bemergency|asap|urgent|burst\b/i.test(text)) return 'ASAP'
  const raw = task.datetime?.type?.trim()
  if (!raw) return 'Flexible'
  const u = raw.toUpperCase().replaceAll(' ', '_')
  if (u === 'FLEXIBLE') return 'Flexible'
  if (u === 'EMERGENCY') return 'ASAP'
  return formatTaskDateTimeType(raw)
}

export type TaskSecondaryFact = {
  key: 'tools' | 'access' | 'parking' | 'pets'
  label: string
  value: string
}

/** Heuristic “details” grid for task detail (until API exposes structured fields). */
export function buildSecondaryTaskFacts(
  task: TaskDetailRecord,
): TaskSecondaryFact[] {
  const t = `${task.title} ${task.description}`.toLowerCase()
  const out: TaskSecondaryFact[] = []

  if (
    /\bi have (the )?tools?\b|tools (are )?ready|bring your own tools/i.test(t)
  ) {
    out.push({
      key: 'tools',
      label: 'Tools',
      value: /\bbring your own tools\b/i.test(t)
        ? 'Worker brings tools'
        : 'I have tools',
    })
  } else if (/\btool|drill|screwdriver\b/i.test(t)) {
    out.push({
      key: 'tools',
      label: 'Tools',
      value: 'See description',
    })
  }

  if (/\beasy access\b|ground floor|no stairs|step-?free/i.test(t)) {
    out.push({ key: 'access', label: 'Access', value: 'Easy access' })
  } else if (/\blift|elevator\b/i.test(t)) {
    out.push({ key: 'access', label: 'Access', value: 'Lift available' })
  } else if (/\bstairs|upper floor|2nd floor|second floor/i.test(t)) {
    out.push({ key: 'access', label: 'Access', value: 'Stairs involved' })
  }

  if (/\bdriveway|off-?street parking\b/i.test(t)) {
    out.push({
      key: 'parking',
      label: 'Parking',
      value: 'Driveway / off street',
    })
  } else if (/\bstreet parking|on-?street\b/i.test(t)) {
    out.push({ key: 'parking', label: 'Parking', value: 'On street' })
  } else if (/\bparking\b/i.test(t)) {
    out.push({ key: 'parking', label: 'Parking', value: 'See description' })
  }

  if (/\bno pets\b|pet-?free/i.test(t)) {
    out.push({ key: 'pets', label: 'Pets', value: 'No pets' })
  } else if (/\bdog|cat|pet\b/i.test(t)) {
    out.push({ key: 'pets', label: 'Pets', value: 'Pets on site' })
  }

  return out
}

export function getSecondaryTaskFact(
  task: TaskDetailRecord,
  key: TaskSecondaryFact['key'],
): TaskSecondaryFact | undefined {
  return buildSecondaryTaskFacts(task).find((f) => f.key === key)
}
