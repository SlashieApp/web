import type { MyTasksViewConfig } from './types'

/** First load, nothing to show yet: card placeholders. */
export const loading: MyTasksViewConfig = {
  search: false,
  body: 'skeleton',
  message: null,
  actions: [],
}
