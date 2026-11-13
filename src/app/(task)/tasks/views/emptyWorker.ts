import type { MyTasksViewConfig } from './types'

/**
 * No tasks yet, and the person has a worker profile: Browse tasks leads, then
 * Post a task (FE-532). A worker's first job is to quote, so it is the main
 * button; a customer sees `empty`, where Post a task leads.
 */
export const emptyWorker: MyTasksViewConfig = {
  search: false,
  body: 'message',
  message: 'empty',
  actions: ['browseTasks', 'postTask'],
}
