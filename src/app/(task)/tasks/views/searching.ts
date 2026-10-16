import type { MyTasksViewConfig } from './types'

/** A new search or category is loading and nothing matches yet. */
export const searching: MyTasksViewConfig = {
  search: true,
  body: 'skeleton',
  message: null,
  actions: [],
}
