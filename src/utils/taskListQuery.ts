import {
  SortDirection,
  type TaskFilter,
  type TaskSort,
  TaskSortField,
} from '@codegen/schema'

/**
 * Shared client-side representation of the list `sort` choice. Maps to the
 * GraphQL {@link TaskSort} input via {@link taskSortToInput}.
 *
 * - `newest` / `oldest` → `CREATED_AT`
 * - `scheduled` → `SCHEDULED_AT` (non-schedulable tasks sort last server-side)
 * - `title` → `TITLE` (case-insensitive)
 * - `nearest` → `DISTANCE` (browse `tasks` only; requires `lat`/`lng`)
 */
export type TaskSortChoice =
  | 'newest'
  | 'oldest'
  | 'scheduled'
  | 'title'
  | 'nearest'

export type TaskListVariables = {
  filter?: TaskFilter
  sort?: TaskSort
}

export function taskSortToInput(choice: TaskSortChoice): TaskSort {
  switch (choice) {
    case 'newest':
      return { field: TaskSortField.CreatedAt, direction: SortDirection.Desc }
    case 'oldest':
      return { field: TaskSortField.CreatedAt, direction: SortDirection.Asc }
    case 'scheduled':
      return {
        field: TaskSortField.ScheduledAt,
        direction: SortDirection.Asc,
      }
    case 'title':
      return { field: TaskSortField.Title, direction: SortDirection.Asc }
    case 'nearest':
      return { field: TaskSortField.Distance, direction: SortDirection.Asc }
  }
}

/** Normalise a free-text value to a trimmed string or `undefined`. */
function cleanText(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** Start-of-day ISO string for an inclusive `createdAfter` / `scheduledAfter` bound. */
export function dayStartIso(
  date: string | null | undefined,
): string | undefined {
  const value = date?.trim()
  if (!value) return undefined
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

/** End-of-day ISO string for an inclusive `createdBefore` / `scheduledBefore` bound. */
export function dayEndIso(date: string | null | undefined): string | undefined {
  const value = date?.trim()
  if (!value) return undefined
  const parsed = new Date(`${value}T23:59:59.999`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

export type BuildTaskFilterInput = {
  search?: string | null
  category?: string | null
  statuses?: readonly string[] | null
  createdAfter?: string | null
  createdBefore?: string | null
  scheduledAfter?: string | null
  scheduledBefore?: string | null
  /** Browse `tasks` geo center (ignored by inbox queries). */
  lat?: number | null
  lng?: number | null
  radiusMiles?: number | null
}

/**
 * Builds a {@link TaskFilter}, omitting empty fields so the server receives a
 * minimal payload. Date strings (`YYYY-MM-DD`) are expanded to inclusive
 * day-granularity ISO bounds.
 */
export function buildTaskFilter(
  input: BuildTaskFilterInput,
): TaskFilter | undefined {
  const filter: TaskFilter = {}

  const search = cleanText(input.search)
  if (search) filter.search = search

  const category = cleanText(input.category)
  if (category) filter.category = category

  if (input.statuses && input.statuses.length > 0) {
    filter.status = input.statuses as TaskFilter['status']
  }

  const createdAfter = dayStartIso(input.createdAfter)
  if (createdAfter) filter.createdAfter = createdAfter
  const createdBefore = dayEndIso(input.createdBefore)
  if (createdBefore) filter.createdBefore = createdBefore

  const scheduledAfter = dayStartIso(input.scheduledAfter)
  if (scheduledAfter) filter.scheduledAfter = scheduledAfter
  const scheduledBefore = dayEndIso(input.scheduledBefore)
  if (scheduledBefore) filter.scheduledBefore = scheduledBefore

  if (typeof input.lat === 'number') filter.lat = input.lat
  if (typeof input.lng === 'number') filter.lng = input.lng
  if (typeof input.radiusMiles === 'number') {
    filter.radiusMiles = input.radiusMiles
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}
