import { formatBudgetAmount, priceToPence } from '@/utils/price'
import type { TaskQuery } from '@codegen/schema'

export type TaskDetailRecord = NonNullable<TaskQuery['task']>

export type AvailabilityChip = {
  key: string
  monthDay: string
  title: string
  subtitle: string
}

export function formatPoundsFromPence(pricePence: number) {
  return `£${(pricePence / 100).toFixed(0)}`
}

export type TaskBudgetViewerContext = 'owner' | 'visitor'

function formatTaskDateTimeType(type: string): string {
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
  const t0 = new Date(task.createdAt).getTime()
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

export function centerColumnStatusLabel(
  task: TaskDetailRecord,
  isOwner: boolean,
): string {
  if (isOwner) {
    const n = task.quotes.length
    const base = taskStatusBadgeLabel(task.status)
    return n ? `${base} · ${n} quote${n === 1 ? '' : 's'}` : base
  }
  return visitorFacingStatusBadge(task.status)
}
