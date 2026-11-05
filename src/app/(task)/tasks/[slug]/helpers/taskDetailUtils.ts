import { taskCategoriesSummary } from '@/app/(task)/helpers/taskCategories'
import { type OrderItem, orderLocationLabel } from '@/utils/orderHelpers'
import { formatBudgetAmount, priceToPence } from '@/utils/price'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { TaskTimelineEventType } from '@codegen/schema'
import type { TaskCoreQuery, TaskQuery } from '@codegen/schema'
import type bag from '../i11n.json'

type TaskDetailCopy = (typeof bag)['en']

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
  /** Every booking the viewer has had on it; `currentTaskOrder` picks theirs. */
  orders: TaskClientRecord['orders']
  /** Why it is suspended (BE-108), for its owner and parties; else null. */
  suspension: TaskClientRecord['suspension']
  /**
   * Where the booking stands (BE-113): the same for every viewer, and it
   * never says who is booked.
   */
  bookingStatus: TaskClientRecord['bookingStatus']
  /** The owner only: `reopenTask` would succeed (BE-113). False for everyone else. */
  canReopen: TaskClientRecord['canReopen']
}

/**
 * Task creation time, from the TASK_CREATED Activity event (every viewer gets
 * it, guests included). Null while the timeline hasn't loaded, and in the
 * owner's guest preview, which has none.
 */
export function taskCreatedAtIso(
  task: Pick<TaskDetailRecord, 'timeline'>,
): string | null {
  return (
    task.timeline?.find((e) => e.type === TaskTimelineEventType.TaskCreated)
      ?.timestamp ?? null
  )
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
 * Hero budget line: the owner's quote range (e.g. "£85–£95"), else the
 * posted budget. Anyone else sees the budget unless they quoted, then their
 * own price; other workers' prices are in the quotes list, not here.
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
      return 'Open'
    }
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) return formatPoundsFromPence(min)
    return `${formatPoundsFromPence(min)}–${formatPoundsFromPence(max)}`
  }
  if (task.budget) return formatBudgetAmount(task.budget)
  return 'Open'
}

/**
 * Short label for quick info from `datetime`. Pass the `Intl` locale and
 * the caller's translated timing labels (keyed by `TaskDateTimeType`) to
 * localise it; English is the fallback.
 */
export function taskAvailabilityRangeLabel(
  task: TaskDetailRecord,
  {
    locale = 'en-GB',
    typeLabels,
  }: {
    locale?: string
    typeLabels?: Partial<Record<string, string>>
  } = {},
): string {
  const dt = task.datetime
  if (!dt) return typeLabels?.FLEXIBLE ?? 'Flexible'
  const datePart = dt.date?.trim()
  if (datePart) {
    const d = new Date(`${datePart}T12:00:00`)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(locale, { weekday: 'short' })
    }
    return datePart
  }
  return typeLabels?.[dt.type] ?? formatTaskDateTimeType(dt.type)
}

export type OwnerInterestLevel = 'low' | 'medium' | 'high'

export function ownerInterestLevel(quoteCount: number): OwnerInterestLevel {
  if (quoteCount >= 5) return 'high'
  if (quoteCount >= 2) return 'medium'
  return 'low'
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

/**
 * Where the map draws this task. The order's snapshot is the booked address,
 * so it only counts when the viewer is allowed the exact location
 * (`taskLocationAccess`); everyone else gets `location` as the API returned
 * it (the fixed public point), never re-derived on the client.
 */
export function taskDetailMapCoordinates(
  task: TaskDetailRecord,
  myOrder: OrderItem | null | undefined,
  showExactLocation: boolean,
): { lat: number; lng: number } | null {
  if (showExactLocation) {
    const orderLat = parseCoord(myOrder?.snapshot?.location?.lat)
    const orderLng = parseCoord(myOrder?.snapshot?.location?.lng)
    if (orderLat != null && orderLng != null) {
      return { lat: orderLat, lng: orderLng }
    }
  }
  return taskMapCoordinates(task)
}

export function taskDetailLocationLabel(input: {
  task: TaskDetailRecord
  myOrder?: OrderItem | null
  showExactLocation: boolean
}): string {
  if (!input.showExactLocation) {
    return taskPublicLocationLabel(input.task) || 'Approximate area'
  }
  if (input.myOrder) {
    return orderLocationLabel(input.myOrder)
  }
  return (
    input.task.location?.address?.trim() ||
    input.task.location?.name?.trim() ||
    taskPublicLocationLabel(input.task) ||
    'Address shared when your quote is accepted'
  )
}

export type OrderCounterpart = {
  name: string
  avatarUrl: string | null
  phone: string | null
  /** Only the poster's email is fetched (for the booked worker). */
  email: string | null
}

/** The other person on the viewer's booking: the worker for the owner, else the poster. */
export function orderCounterpart(
  task: Pick<TaskDetailRecord, 'quotes' | 'poster'>,
  order: Pick<OrderItem, 'quoteId'>,
  isOwner: boolean,
  copy: Pick<TaskDetailCopy, 'fallbackCustomer' | 'booking'>,
): OrderCounterpart {
  const profile = isOwner
    ? task.quotes.find((quote) => quote.id === order.quoteId)?.worker?.profile
    : task.poster?.profile
  return {
    name:
      profile?.name?.trim() ||
      (isOwner ? copy.booking.yourWorkerFallback : copy.fallbackCustomer),
    avatarUrl: profile?.avatarUrl?.trim() || null,
    phone: profile?.contactNumber?.trim() || null,
    email: isOwner ? null : task.poster?.email?.trim() || null,
  }
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

export function workerQuoteAvatarLabel(workerUserId: string) {
  const alnum = workerUserId.replace(/[^a-zA-Z0-9]/g, '')
  if (alnum.length >= 2) return alnum.slice(0, 2)
  if (alnum.length === 1) return `${alnum}P`
  return 'PR'
}

const CATEGORY_KEYWORDS: ReadonlyArray<[RegExp, string]> = [
  [/deliver|courier|parcel/i, 'Delivery'],
  [/handyman|shelf|fix|mount|drill|plaster|wall/i, 'Handyman'],
  [/clean|hoover|tidy|vacuum/i, 'Cleaning'],
  [/mov(e|ing)|furniture/i, 'Moving'],
  [/tech|computer|wifi|setup|router/i, 'Tech setup'],
]

/** Category chip: the task's categories (BE-79), then title/description heuristics. */
export function taskCategoryLabel(
  task: Pick<TaskDetailRecord, 'title' | 'description' | 'categories'>,
): string | null {
  const fromApi = taskCategoriesSummary(task.categories, 2)
  if (fromApi) return fromApi
  const t = `${task.title} ${task.description}`
  for (const [re, label] of CATEGORY_KEYWORDS) {
    if (re.test(t)) return label
  }
  return null
}

/** Fields the report dialog shows so the reporter can confirm the listing. */
export function taskReportSubject(
  task: Pick<
    TaskDetailRecord,
    'title' | 'description' | 'categories' | 'images' | 'location'
  >,
  seed?: { thumbnailSrc?: string } | null,
): {
  targetTitle?: string
  targetMeta?: string
  targetImageSrc?: string
} {
  const targetTitle = task.title?.trim() || undefined
  const location = taskPublicLocationLabel(task).trim()
  const category = taskCategoryLabel(task)
  const targetMeta =
    [location, category].filter(Boolean).join(' · ') || undefined
  const fromTask = (task.images ?? []).find((src) => src?.trim())?.trim()
  const targetImageSrc = fromTask || seed?.thumbnailSrc?.trim() || undefined
  return { targetTitle, targetMeta, targetImageSrc }
}
