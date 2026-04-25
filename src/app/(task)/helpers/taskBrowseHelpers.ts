import type { TaskListItem } from '@/graphql/tasks-query.types'
import { budgetToPence, priceToPence } from '@/utils/price'
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
  const fixed = budgetToPence(task.budget)
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
  const prices = quotes
    .map((o) => priceToPence(o.price))
    .filter((price): price is number => price != null)
  if (prices.length === 0) return { main: 'Open', sub: 'Estimated budget' }
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

export function inferBadge(task: TaskListItem): { text?: string } {
  const fixed = budgetToPence(task.budget)
  const t = `${task.title} ${task.description}`.toLowerCase()
  if (t.includes('emergency') || t.includes('urgent') || t.includes('burst')) {
    return { text: 'Emergency' }
  }
  if (task.description.length > 280 || (fixed != null && fixed >= 50_000)) {
    return { text: 'Big project' }
  }
  return {}
}

/**
 * Best-effort price for budget filters when the server query is geo-only.
 * Uses fixed quote price when set; otherwise the lowest worker quote.
 */
export function effectiveTaskPricePenceForFilter(
  task: TaskListItem,
): number | null {
  const fixed = budgetToPence(task.budget)
  if (fixed != null && fixed > 0) return fixed
  const quotes = task.quotes ?? []
  if (!quotes.length) return null
  const prices = quotes
    .map((o) => priceToPence(o.price))
    .filter((price): price is number => price != null)
  if (prices.length === 0) return null
  return Math.min(...prices)
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
