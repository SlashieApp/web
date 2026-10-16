import type { EditTaskViewConfig } from './types'

/** No task: removed, hidden, or a bad link. */
export const editNotFound: EditTaskViewConfig = {
  layout: 'status',
  title: 'notFoundTitle',
  body: 'notFoundBody',
  actions: ['myTasks'],
}
