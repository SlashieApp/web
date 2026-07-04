import type { TaskCoreQuery } from '@codegen/schema'

type TaskViewsRecord = Pick<NonNullable<TaskCoreQuery['task']>, 'views'>

const COLD_START_VIEWS_LABEL = 'New — reaching workers'

/** Public `task.views` line for non-owners (null = cold-start copy; hidden below threshold). */
export function taskPublicViewsLabel(
  views: number | null | undefined,
): string | null {
  if (views == null) return COLD_START_VIEWS_LABEL
  if (views >= 3) return `${views} views`
  return null
}

/** Owner views line from public `task.views` (the exposure breakdown was removed). */
export function taskOwnerViewsLabel(task: TaskViewsRecord): string | null {
  const count = task.views
  if (count == null) return COLD_START_VIEWS_LABEL
  if (count < 3) return null
  return `${count} views`
}

/** Task detail meta: always show the count (browse cards keep the ≥3 threshold). */
export function taskDetailViewsLabel(
  task: TaskViewsRecord,
  _isOwner?: boolean,
): string | null {
  const count = task.views
  if (count == null) return COLD_START_VIEWS_LABEL
  return `${count} ${count === 1 ? 'view' : 'views'}`
}

export function appendViewsToStatusLabel(
  base: string,
  viewsLabel: string | null,
): string {
  if (!viewsLabel) return base
  return `${base} · ${viewsLabel}`
}
