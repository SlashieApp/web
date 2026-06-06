import type { TaskListItem } from '@/graphql/tasks-query.types'
import {
  distanceMilesBetween,
  formatDistanceAwayLabel,
  parseGeoCoord,
} from '@/utils/geoDistance'
import { budgetToPence, priceToPence } from '@/utils/price'

import type { BrowseReferenceLocation } from './browseReferenceLocation'
import type { UrgencyFilter } from './taskBrowseFilters.types'
import { taskCategoryDisplayLabel } from './taskCategories'

export const PAGE_SIZE = 5

export const SORT_OPTIONS = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'scheduled', label: 'Scheduled date' },
  { value: 'title', label: 'Title (A–Z)' },
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

/** Display name for browse cards: canonical `profile.name`. */
export function taskPosterDisplayName(task: TaskListItem): string {
  const profileName = task.poster?.profile?.name?.trim()
  if (profileName) return profileName
  return 'Task owner'
}

/** Public display name for a worker (`profile.name`). */
export function workerDisplayName(
  worker:
    | {
        profile?: { name?: string | null } | null
      }
    | null
    | undefined,
): string {
  return worker?.profile?.name?.trim() || 'Worker'
}

/** Worker's legal name (`Worker.legalName`); use when legal identity is required. */
export function workerLegalName(
  worker:
    | {
        legalName?: string | null
      }
    | null
    | undefined,
): string | null {
  const name = worker?.legalName?.trim()
  return name || null
}

export function taskPosterAvatarUrl(task: TaskListItem): string | undefined {
  const u = task.poster?.profile?.avatarUrl?.trim()
  return u || undefined
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

/** Matches initial `submittedRadiusMiles` in browse context. */
export const DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES = 10

export type BrowseFilterTag =
  | { kind: 'radius'; label: string; miles: number }
  | { kind: 'location'; label: string }
  | { kind: 'budget'; label: string }
  | { kind: 'urgency'; label: string; value: UrgencyFilter }
  | { kind: 'category'; label: string; value: string }
  | { kind: 'scheduled'; label: string }
  | { kind: 'search'; label: string; query: string }

export function taskDistanceMilesFromReference(
  task: TaskListItem,
  reference: Pick<BrowseReferenceLocation, 'lat' | 'lng'>,
): number | null {
  const lat = parseGeoCoord(task.location?.lat)
  const lng = parseGeoCoord(task.location?.lng)
  if (lat == null || lng == null) return null
  return distanceMilesBetween(reference.lat, reference.lng, lat, lng)
}

export function taskDistanceLabelFromReference(
  task: TaskListItem,
  reference: Pick<BrowseReferenceLocation, 'lat' | 'lng'>,
): string | undefined {
  return formatDistanceAwayLabel(
    taskDistanceMilesFromReference(task, reference),
  )
}

function milesToKmRounded(miles: number): number {
  return Math.round(miles * 1.60934)
}

function formatSubmittedBudgetRange(
  minBudgetPounds: string,
  maxBudgetPounds: string,
): string {
  const min = Number.parseFloat(minBudgetPounds)
  const max = Number.parseFloat(maxBudgetPounds)
  const minLabel = Number.isFinite(min) ? `$${Math.round(min)}` : '$0'
  const maxLabel = Number.isFinite(max) ? `$${Math.round(max)}` : '$150+'
  return `${minLabel} - ${maxLabel}`
}

function submittedUrgencyChipLabel(u: UrgencyFilter): string | null {
  if (u === 'any') return null
  const map: Record<Exclude<UrgencyFilter, 'any'>, string> = {
    emergency: 'ASAP',
    today: 'Today',
    week: 'Flexible',
  }
  return map[u]
}

function truncateChipLabel(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s
  return `${s.slice(0, maxLen - 1)}…`
}

/** Human-readable chips for the last submitted browse filters (list + fetch). */
export function buildActiveBrowseFilterTags(input: {
  submittedRadiusMiles: number
  submittedMinBudget: string
  submittedMaxBudget: string
  submittedUrgency: UrgencyFilter
  submittedCategory: string
  submittedScheduledAfter: string
  submittedScheduledBefore: string
  submittedSearchText: string
  referenceLabel: string
}): BrowseFilterTag[] {
  const tags: BrowseFilterTag[] = []
  const {
    submittedRadiusMiles,
    submittedMinBudget,
    submittedMaxBudget,
    submittedUrgency,
    submittedCategory,
    submittedScheduledAfter,
    submittedScheduledBefore,
    submittedSearchText,
    referenceLabel,
  } = input

  tags.push({
    kind: 'radius',
    label: `Within ${milesToKmRounded(submittedRadiusMiles)} km`,
    miles: submittedRadiusMiles,
  })

  const minS = submittedMinBudget.trim()
  const maxS = submittedMaxBudget.trim()
  if (minS || maxS) {
    tags.push({
      kind: 'budget',
      label: formatSubmittedBudgetRange(minS, maxS),
    })
  }

  const urgencyLabel = submittedUrgencyChipLabel(submittedUrgency)
  if (urgencyLabel) {
    tags.push({
      kind: 'urgency',
      label: urgencyLabel,
      value: submittedUrgency,
    })
  }

  const categoryValue = submittedCategory.trim()
  if (categoryValue) {
    tags.push({
      kind: 'category',
      label: taskCategoryDisplayLabel(categoryValue) ?? categoryValue,
      value: categoryValue,
    })
  }

  const scheduledAfter = submittedScheduledAfter.trim()
  const scheduledBefore = submittedScheduledBefore.trim()
  if (scheduledAfter || scheduledBefore) {
    const from = scheduledAfter || '…'
    const to = scheduledBefore || '…'
    tags.push({
      kind: 'scheduled',
      label: `Scheduled ${from} – ${to}`,
    })
  }

  const q = submittedSearchText.trim()
  if (q) {
    tags.push({
      kind: 'search',
      label: truncateChipLabel(q, 24),
      query: q,
    })
  }

  const area = referenceLabel.trim()
  if (area) {
    tags.push({
      kind: 'location',
      label: truncateChipLabel(area, 28),
    })
  }

  return tags
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
