import type { EditTaskViewConfig } from './types'

/** Signed in, but someone else posted the task. */
export const editNotOwner: EditTaskViewConfig = {
  layout: 'status',
  title: 'notOwnerTitle',
  body: 'notOwnerBody',
  actions: ['viewTask'],
}
