import type { EditTaskViewConfig } from './types'

/** The task didn't load (network or server). */
export const editLoadError: EditTaskViewConfig = {
  layout: 'status',
  title: 'loadErrorTitle',
  body: 'loadErrorBody',
  actions: ['retry', 'myTasks'],
}
