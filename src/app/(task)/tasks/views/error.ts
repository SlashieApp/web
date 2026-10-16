import type { MyTasksViewConfig } from './types'

/** The lists failed and there's nothing cached to show. */
export const error: MyTasksViewConfig = {
  search: false,
  body: 'message',
  message: 'error',
  actions: ['retry'],
}
