const COLD_START_VIEWS_LABEL = 'New: reaching workers'

/** Public `task.views` line for non-owners (null = cold-start copy; hidden below threshold). */
export function taskPublicViewsLabel(
  views: number | null | undefined,
): string | null {
  if (views == null) return COLD_START_VIEWS_LABEL
  if (views >= 3) return `${views} views`
  return null
}
