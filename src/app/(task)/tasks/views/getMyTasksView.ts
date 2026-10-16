import type { MyTasksView } from './types'

export type MyTasksViewInput = {
  /** Any task at all, before search and filters. */
  hasTasks: boolean
  /** Rows left after search and filters. */
  hasMatches: boolean
  /** The first load, or a search that is still loading. */
  loading: boolean
  /** A list query failed. */
  failed: boolean
  /** Search text, a category or Hosted / Quoted is set. */
  filtered: boolean
}

/** Whether there are tasks at all comes first, then what the search left. */
export function getMyTasksView({
  hasTasks,
  hasMatches,
  loading,
  failed,
  filtered,
}: MyTasksViewInput): MyTasksView {
  if (!hasTasks) {
    if (loading) return 'loading'
    return failed ? 'error' : 'empty'
  }
  if (hasMatches) return 'list'
  if (loading) return 'searching'
  if (failed) return 'error'
  return filtered ? 'noMatches' : 'list'
}
