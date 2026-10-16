import type { EditTaskViewConfig } from './types'

/** Cancelled: nothing to edit, but it can be posted again. */
export const editCancelled: EditTaskViewConfig = {
  layout: 'status',
  title: 'cancelledTitle',
  body: 'cancelledBody',
  actions: ['repost', 'viewTask'],
}
