import { DayOfWeek, type TaskQuery } from '@codegen/schema'

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

function formatMajorGbp(amount: number) {
  return `£${amount.toFixed(0)}`
}

export type TaskBudgetViewerContext = 'owner' | 'visitor'

/**
 * Hero budget line: quote range (role-aware), posted budget range, fixed quote pence, or open.
 * For visitors, only the signed-in worker's own quotes count toward the range so competitor
 * prices are not inferred from `task.quotes`.
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
    const prices = quotes.map((q) => q.pricePence)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) return formatPoundsFromPence(min)
    return `${formatPoundsFromPence(min)} — ${formatPoundsFromPence(max)}`
  }
  const br = task.budgetRange
  if (br?.min != null && br?.max != null && br.min !== br.max) {
    return `${formatMajorGbp(br.min)} — ${formatMajorGbp(br.max)}`
  }
  if (br?.min != null) return formatMajorGbp(br.min)
  if (task.priceQuotePence != null && task.priceQuotePence > 0) {
    return formatPoundsFromPence(task.priceQuotePence)
  }
  return 'Open to quotes'
}

const DAY_SORT: Record<DayOfWeek, number> = {
  [DayOfWeek.Mon]: 1,
  [DayOfWeek.Tue]: 2,
  [DayOfWeek.Wed]: 3,
  [DayOfWeek.Thu]: 4,
  [DayOfWeek.Fri]: 5,
  [DayOfWeek.Sat]: 6,
  [DayOfWeek.Sun]: 7,
}

const DAY_SHORT: Record<DayOfWeek, string> = {
  [DayOfWeek.Mon]: 'MON',
  [DayOfWeek.Tue]: 'TUE',
  [DayOfWeek.Wed]: 'WED',
  [DayOfWeek.Thu]: 'THU',
  [DayOfWeek.Fri]: 'FRI',
  [DayOfWeek.Sat]: 'SAT',
  [DayOfWeek.Sun]: 'SUN',
}

const DAY_LONG: Record<DayOfWeek, string> = {
  [DayOfWeek.Mon]: 'Monday',
  [DayOfWeek.Tue]: 'Tuesday',
  [DayOfWeek.Wed]: 'Wednesday',
  [DayOfWeek.Thu]: 'Thursday',
  [DayOfWeek.Fri]: 'Friday',
  [DayOfWeek.Sat]: 'Saturday',
  [DayOfWeek.Sun]: 'Sunday',
}

function slotSubtitle(slot: string) {
  const trimmed = slot.trim()
  if (/^\d{2}:\d{2}/.test(trimmed)) return trimmed.replace('-', ' – ')
  return trimmed
}

/** Flatten `availability` into scrollable chips; falls back to `dateTime` when empty. */
export function buildAvailabilityChips(
  task: TaskDetailRecord,
): AvailabilityChip[] {
  const rows = [...task.availability].sort(
    (a, b) => DAY_SORT[a.day] - DAY_SORT[b.day],
  )
  const out: AvailabilityChip[] = []
  for (const row of rows) {
    for (const slot of row.slots) {
      out.push({
        key: `${row.day}-${slot}`,
        monthDay: DAY_SHORT[row.day],
        title: DAY_LONG[row.day],
        subtitle: slotSubtitle(slot),
      })
      if (out.length >= 8) return out
    }
  }

  if (out.length === 0 && task.dateTime) {
    const d = new Date(task.dateTime)
    if (!Number.isNaN(d.getTime())) {
      const monthDay = d
        .toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
        .toUpperCase()
      out.push({
        key: 'preferred-datetime',
        monthDay,
        title: d.toLocaleDateString('en-GB', { weekday: 'long' }),
        subtitle: d.toLocaleTimeString('en-GB', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      })
    }
  }
  return out
}

/** Budget shown on the owner quick-info card (posted budget, not quote range). */
export function taskOwnerPostedBudgetLine(task: TaskDetailRecord): string {
  const br = task.budgetRange
  if (br?.min != null && br?.max != null && br.min !== br.max) {
    return `${formatMajorGbp(br.min)} — ${formatMajorGbp(br.max)}`
  }
  if (br?.min != null) return formatMajorGbp(br.min)
  if (task.priceQuotePence != null && task.priceQuotePence > 0) {
    return formatPoundsFromPence(task.priceQuotePence)
  }
  return 'Open to quotes'
}

/** Short label for quick info, e.g. "MON – WED" or "Flexible". */
export function taskAvailabilityRangeLabel(task: TaskDetailRecord): string {
  const rows = [...task.availability].sort(
    (a, b) => DAY_SORT[a.day] - DAY_SORT[b.day],
  )
  if (rows.length === 0) {
    if (!task.dateTime) return 'Flexible'
    const d = new Date(task.dateTime)
    if (Number.isNaN(d.getTime())) return 'Flexible'
    return d.toLocaleDateString('en-GB', { weekday: 'short' })
  }
  if (rows.length === 1) return DAY_SHORT[rows[0].day]
  return `${DAY_SHORT[rows[0].day]} – ${DAY_SHORT[rows[rows.length - 1].day]}`
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

/** Task centre for map display; prefers `location` then falls back to flat lat/lng fields. */
export function taskMapCoordinates(
  task: TaskDetailRecord,
): { lat: number; lng: number } | null {
  const lat = parseCoord(task.location?.lat) ?? parseCoord(task.locationLat)
  const lng = parseCoord(task.location?.lng) ?? parseCoord(task.locationLng)
  if (lat == null || lng == null) return null
  return { lat, lng }
}
