import type { TaskListItem } from '@/graphql/tasks-query.types'
import type { JobCardBadgeVariant } from '../components/(web)/TaskBrowseListItem'
import type { UrgencyFilter } from './taskBrowseFilters.types'

export const PAGE_SIZE = 5

export const SORT_OPTIONS = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
] as const

export function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function endOfLocalDay(d = new Date()) {
  const x = startOfLocalDay(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function formatBudget(task: TaskListItem): {
  main: string
  sub: string
} {
  const fixed = task.priceQuotePence
  if (fixed != null && fixed > 0) {
    return {
      main: `£${(fixed / 100).toFixed(0)}`,
      sub: 'Fixed price',
    }
  }
  const quotes = task.quotes ?? []
  if (quotes.length === 0) {
    return { main: 'Open', sub: 'Estimated budget' }
  }
  const prices = quotes.map((o) => o.pricePence)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) {
    return {
      main: `£${(min / 100).toFixed(0)}`,
      sub: 'From quotes',
    }
  }
  return {
    main: `£${(min / 100).toFixed(0)} – £${(max / 100).toFixed(0)}`,
    sub: 'Estimated budget',
  }
}

export function taskCreatedTime(task: TaskListItem): number {
  const raw = task.createdAt
  const d =
    typeof raw === 'string' || typeof raw === 'number'
      ? new Date(raw)
      : raw instanceof Date
        ? raw
        : null
  if (!d || Number.isNaN(d.getTime())) return 0
  return d.getTime()
}

export function inferBadge(task: TaskListItem): {
  variant: JobCardBadgeVariant
  text?: string
} {
  const t = `${task.title} ${task.description}`.toLowerCase()
  if (t.includes('emergency') || t.includes('urgent') || t.includes('burst')) {
    return { variant: 'emergency', text: 'EMERGENCY' }
  }
  if (
    task.description.length > 280 ||
    (task.priceQuotePence != null && task.priceQuotePence >= 50_000)
  ) {
    return { variant: 'featured', text: 'BIG PROJECT' }
  }
  return { variant: 'none' }
}

/**
 * Best-effort price for budget filters when the server query is geo-only.
 * Uses fixed quote price when set; otherwise the lowest worker quote.
 */
export function effectiveTaskPricePenceForFilter(
  task: TaskListItem,
): number | null {
  const fixed = task.priceQuotePence
  if (fixed != null && fixed > 0) return fixed
  const quotes = task.quotes ?? []
  if (!quotes.length) return null
  return Math.min(...quotes.map((o) => o.pricePence))
}

export function matchesUrgency(
  task: TaskListItem,
  urgency: UrgencyFilter,
): boolean {
  if (urgency === 'any') return true
  const t = `${task.title} ${task.description}`.toLowerCase()
  if (urgency === 'emergency') {
    return (
      t.includes('emergency') ||
      t.includes('urgent') ||
      t.includes('asap') ||
      t.includes('burst')
    )
  }
  const ms = taskCreatedTime(task)
  if (!ms) return true
  const age = Date.now() - ms
  const day = 86_400_000
  if (urgency === 'today') return age <= day
  if (urgency === 'week') return age <= 7 * day
  return true
}
