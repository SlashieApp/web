import type { TaskDetailViewConfig } from './types'

/** Worker, task AWARDED to someone else, their quote is NOT_SELECTED. */
export const workerNotSelected: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'notSelectedHeadline',
  subline: 'notSelectedSubline',
  facts: ['location', 'categories', 'postedBy', 'description', 'photos'],
  primaryAction: 'browseTasks',
}
