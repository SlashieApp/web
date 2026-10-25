import { TaskDateTimeType } from '@codegen/schema'

import type { TaskListItem } from '@/graphql/tasks-query.types'
import {
  distanceMilesBetween,
  formatDistanceAwayLabel,
  parseGeoCoord,
} from '@/utils/geoDistance'
import { budgetToPence, formatGbpMajor, priceToPence } from '@/utils/price'
import {
  type TaskDatetimeLike,
  parseTaskScheduleDate,
  scheduleChipForTask,
} from '@/utils/taskJobSchedule'

import type { BrowseReferenceLocation } from './browseReferenceLocation'

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
  /** False when there is no fixed budget or quote range — cards omit the £ slot. */
  hasBudget: boolean
} {
  const open = { main: 'Open', sub: 'Estimated budget', hasBudget: false }
  const fixed = budgetToPence(task.budget)
  if (fixed != null && fixed > 0) {
    return {
      main: formatGbpMajor(fixed / 100),
      sub: 'Fixed price',
      hasBudget: true,
    }
  }
  const quotes = task.quotes ?? []
  if (quotes.length === 0) return open
  const prices = quotes
    .map((o) => priceToPence(o.price))
    .filter((price): price is number => price != null)
  if (prices.length === 0) return open
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) {
    return {
      main: formatGbpMajor(min / 100),
      sub: 'From quotes',
      hasBudget: true,
    }
  }
  return {
    main: `${formatGbpMajor(min / 100)} – ${formatGbpMajor(max / 100)}`,
    sub: 'Estimated budget',
    hasBudget: true,
  }
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

/** Matches initial `submittedRadiusMiles` in browse context. */
export const DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES = 10

/** Applied search filters (FE-201); every chip can be removed on its own. */
export type BrowseFilterTag = {
  kind: 'search' | 'date' | 'budget'
  label: string
}

/** Scheduled-date filter; `from` / `to` are inclusive local `YYYY-MM-DD`. */
export type BrowseDateFilter = {
  preset: 'today' | 'week' | 'custom'
  from: string
  to: string
}

/** Budget filter in whole pounds (raw `budget.amount`, any budget type). */
export type BrowseBudgetFilter = { min: number | null; max: number | null }

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

/**
 * Short distance for the card pin row ("1.2 miles"); the standalone "away"
 * phrasing stays in {@link formatDistanceAwayLabel}.
 */
export function taskDistanceShortLabelFromReference(
  task: TaskListItem,
  reference: Pick<BrowseReferenceLocation, 'lat' | 'lng'>,
): string | undefined {
  const miles = taskDistanceMilesFromReference(task, reference)
  if (miles == null || !Number.isFinite(miles)) return undefined
  if (miles < 0.05) return 'Nearby'
  if (miles < 10) return `${miles.toFixed(1)} miles`
  return `${Math.round(miles)} miles`
}

/** Compact card schedule label: "Flexible", "Today", "Tomorrow", "Before 21 Jun" or "Sat 21 Jun". */
export function taskScheduleCompactLabel(
  datetime: TaskDatetimeLike | null | undefined,
  now = new Date(),
): string | null {
  if (!datetime) return null
  if (datetime.type === TaskDateTimeType.Flexible) return 'Flexible'
  if (datetime.type === TaskDateTimeType.Before) {
    const date = datetime.date?.trim()
    if (!date) return 'Flexible'
    const parsed = new Date(`${date}T00:00`)
    if (Number.isNaN(parsed.getTime())) return 'Flexible'
    return `Before ${new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
    }).format(parsed)}`
  }
  const chip = scheduleChipForTask(datetime, now)
  if (chip === 'today') return 'Today'
  if (chip === 'tomorrow') return 'Tomorrow'
  const when = parseTaskScheduleDate(datetime)
  if (!when) return null
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(when)
}

/** "5 quotes" card label. Public `tasks` browse doesn't select quotes → null (row hidden). */
export function milesToKmRounded(miles: number): number {
  return Math.round(miles * 1.60934)
}

export function kmToMilesRounded(km: number): number {
  return Math.max(1, Math.round(km / 1.60934))
}

function truncateChipLabel(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s
  return `${s.slice(0, maxLen - 1)}…`
}

/** Local calendar day as `YYYY-MM-DD`. */
export function localDateKey(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** Today, or today through Sunday ("This week"). */
export function browseDatePresetRange(
  preset: 'today' | 'week',
  now = new Date(),
): BrowseDateFilter {
  const from = localDateKey(now)
  if (preset === 'today') return { preset, from, to: from }
  const sunday = new Date(now)
  sunday.setDate(now.getDate() + ((7 - now.getDay()) % 7))
  return { preset, from, to: localDateKey(sunday) }
}

/**
 * Whole-pound budget bounds from the typed inputs. Blank or invalid → null;
 * a minimum above the maximum is reported so nothing is sent.
 */
export function parseBrowseBudget(
  minInput: string,
  maxInput: string,
): BrowseBudgetFilter & { invalid: boolean } {
  const parse = (raw: string) => {
    const n = Number.parseFloat(raw.trim())
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null
  }
  const min = parse(minInput)
  const max = parse(maxInput)
  return { min, max, invalid: min != null && max != null && min > max }
}

function shortDay(key: string, locale: string): string {
  const d = new Date(`${key}T12:00:00`)
  if (Number.isNaN(d.getTime())) return key
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(d)
}

export type BrowseFilterTagCopy = {
  today: string
  thisWeek: string
  /** `{date}` placeholder. */
  fromDate: string
  untilDate: string
  /** `{amount}` placeholder. */
  budgetFrom: string
  budgetUpTo: string
}

/** Chips for the applied search text, date and budget. */
export function buildActiveBrowseFilterTags(
  input: {
    searchText: string
    dateFilter: BrowseDateFilter | null
    budget: BrowseBudgetFilter
  },
  copy: BrowseFilterTagCopy,
  locale = 'en-GB',
): BrowseFilterTag[] {
  const tags: BrowseFilterTag[] = []
  const q = input.searchText.trim()
  if (q) tags.push({ kind: 'search', label: `“${truncateChipLabel(q, 24)}”` })

  const date = input.dateFilter
  if (date && (date.from || date.to)) {
    const label =
      date.preset === 'today'
        ? copy.today
        : date.preset === 'week'
          ? copy.thisWeek
          : date.from && date.to
            ? `${shortDay(date.from, locale)} – ${shortDay(date.to, locale)}`
            : date.from
              ? copy.fromDate.replace('{date}', shortDay(date.from, locale))
              : copy.untilDate.replace('{date}', shortDay(date.to, locale))
    tags.push({ kind: 'date', label })
  }

  const { min, max } = input.budget
  if (min != null || max != null) {
    const label =
      min != null && max != null
        ? `${formatGbpMajor(min)} – ${formatGbpMajor(max)}`
        : min != null
          ? copy.budgetFrom.replace('{amount}', formatGbpMajor(min))
          : copy.budgetUpTo.replace('{amount}', formatGbpMajor(max ?? 0))
    tags.push({ kind: 'budget', label })
  }
  return tags
}

export type TaskCardMetaPart = {
  kind: 'budget' | 'distance' | 'timing'
  label: string
}

/**
 * Scan-row parts for the card meta line: £ budget · distance · timing, or
 * timing first when it leads (a booked job's time).
 */
export function taskCardMetaParts(input: {
  priceLabel?: string | null
  distanceLabel?: string | null
  timingLabel?: string | null
  timingFirst?: boolean
}): TaskCardMetaPart[] {
  const parts: TaskCardMetaPart[] = [
    { kind: 'budget', label: input.priceLabel?.trim() ?? '' },
    { kind: 'distance', label: input.distanceLabel?.trim() ?? '' },
    { kind: 'timing', label: input.timingLabel?.trim() ?? '' },
  ]
  const shown = parts.filter((part) => part.label)
  if (!input.timingFirst) return shown
  return [
    ...shown.filter((part) => part.kind === 'timing'),
    ...shown.filter((part) => part.kind !== 'timing'),
  ]
}

/**
 * How far from the sort centre the loaded results reach, in miles. Pages come
 * nearest first, so they cover a circle out to the furthest loaded task; once
 * every match is loaded (or there are none) the whole map is covered. Null
 * before the first page arrives. "Search this area" only offers beyond it.
 */
export function browseCoverageMiles(
  tasks: readonly TaskListItem[] | undefined,
  hasMore: boolean,
  centerLat: number,
  centerLng: number,
): number | null {
  if (!tasks) return null
  if (!hasMore) return Number.POSITIVE_INFINITY
  let furthest = 0
  for (const task of tasks) {
    const lat = parseGeoCoord(task.location?.lat)
    const lng = parseGeoCoord(task.location?.lng)
    if (lat == null || lng == null) continue
    furthest = Math.max(
      furthest,
      distanceMilesBetween(centerLat, centerLng, lat, lng),
    )
  }
  return furthest
}
