import type { TaskDetailViewConfig } from './types'

/**
 * Worker whose quote is still PENDING after the task's booking was completed
 * by someone else (BE-113). Status only, as `worker.bookedByOther`.
 */
export const workerCompletedByOther: TaskDetailViewConfig = {
  pill: 'COMPLETED',
  headline: 'taskCompletedHeadline',
  subline: 'browseSubline',
  facts: ['location', 'categories', 'postedBy', 'description', 'photos'],
  primaryAction: 'browseTasks',
}
