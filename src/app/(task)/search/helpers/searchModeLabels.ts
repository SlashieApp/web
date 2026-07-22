import type { SearchMode } from './searchQueryParams'

/** Stable mode order for the segmented control (labels come from i11n). */
export const SEARCH_MODE_VALUES = [
  'tasks',
  'workers',
] as const satisfies ReadonlyArray<SearchMode>

export type SearchModeCopy = {
  searchingFor: string
  nearby: string
  ariaSearchingFor: string
  ariaSearchMode: string
  tasksInline: string
  workerInline: string
  tasksToggle: string
  workersToggle: string
}

export function searchModeInlineLabel(
  copy: SearchModeCopy,
  mode: SearchMode,
): string {
  return mode === 'workers' ? copy.workerInline : copy.tasksInline
}

export function searchModeToggleOptions(copy: SearchModeCopy): ReadonlyArray<{
  value: SearchMode
  label: string
}> {
  return [
    { value: 'tasks', label: copy.tasksToggle },
    { value: 'workers', label: copy.workersToggle },
  ]
}
