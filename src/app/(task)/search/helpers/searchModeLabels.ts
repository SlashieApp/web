import type { SearchMode } from './searchQueryParams'

/** Inline button label in the collapsed “Searching for … nearby” sentence. */
export const SEARCH_MODE_INLINE_LABEL: Record<SearchMode, string> = {
  tasks: 'tasks',
  workers: 'worker',
}

/** Segmented toggle labels. */
export const SEARCH_MODE_TOGGLE_OPTIONS: ReadonlyArray<{
  value: SearchMode
  label: string
}> = [
  { value: 'tasks', label: 'Tasks' },
  { value: 'workers', label: 'Workers' },
]
