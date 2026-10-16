import type { MyTasksViewConfig } from './types'

/** The search or filters leave nothing. */
export const noMatches: MyTasksViewConfig = {
  search: true,
  body: 'message',
  message: 'noMatches',
  actions: ['clearFilters'],
}
