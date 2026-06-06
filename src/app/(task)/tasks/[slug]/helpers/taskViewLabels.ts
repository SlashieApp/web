import type { TaskDetailRecord } from './taskDetailUtils'

const COLD_START_VIEWS_LABEL = 'New — reaching workers'

/** Public `task.views` line for non-owners (null = cold-start copy; hidden below threshold). */
export function taskPublicViewsLabel(
  views: number | null | undefined,
): string | null {
  if (views == null) return COLD_START_VIEWS_LABEL
  if (views >= 3) return `${views} views`
  return null
}

/** Owner-only exposure line from `task.exposure` with public `views` fallback. */
export function taskOwnerViewsLabel(task: TaskDetailRecord): string | null {
  const exposure = task.exposure
  if (exposure?.showViews === false) return COLD_START_VIEWS_LABEL

  const count = exposure?.viewCount ?? task.views
  if (count == null) return COLD_START_VIEWS_LABEL
  if (count < 3) return null

  const unique =
    exposure?.uniqueViewers != null ? ` · ${exposure.uniqueViewers} unique` : ''
  return `${count} views${unique}`
}

export function appendViewsToStatusLabel(
  base: string,
  viewsLabel: string | null,
): string {
  if (!viewsLabel) return base
  return `${base} · ${viewsLabel}`
}
