import type { MyTasksViewConfig } from './types'

/** No posted tasks and no quotes yet. */
export const empty: MyTasksViewConfig = {
  search: false,
  body: 'message',
  message: 'empty',
  actions: ['postTask', 'browseTasks'],
}
