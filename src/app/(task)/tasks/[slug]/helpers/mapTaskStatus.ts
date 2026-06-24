/** Canonical task listing phase for task detail UI. */
export type MappedTaskStatus = 'OPEN' | 'AWARDED' | 'CLOSED'

/**
 * Maps API / legacy `task.status` strings to the three UI phases.
 * This is the only place that should interpret legacy task status values.
 */
export function mapTaskStatus(
  status: string | null | undefined,
): MappedTaskStatus {
  const s = (status ?? '').trim().toUpperCase().replaceAll(' ', '_')

  if (s === 'OPEN' || s === 'POSTED' || s === 'PUBLISHED' || s === 'DRAFT') {
    return 'OPEN'
  }

  if (
    s === 'QUOTE_ACCEPTED' ||
    s === 'AWARDED' ||
    s === 'IN_PROGRESS' ||
    s === 'INPROGRESS'
  ) {
    return 'AWARDED'
  }

  if (
    s === 'COMPLETED' ||
    s === 'CONFIRMED' ||
    s === 'CANCELLED' ||
    s === 'CLOSED'
  ) {
    return 'CLOSED'
  }

  return 'OPEN'
}

/**
 * True when the raw task status is a cancellation. `mapTaskStatus` collapses this
 * into `CLOSED`; this lets the UI distinguish a cancelled task from a completed one.
 */
export function isCancelledTaskStatus(
  status: string | null | undefined,
): boolean {
  return (
    (status ?? '').trim().toUpperCase().replaceAll(' ', '_') === 'CANCELLED'
  )
}
