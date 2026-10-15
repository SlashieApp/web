import type { TaskDetailViewConfig } from './types'

/** Worker, task AWARDED to someone else, their quote was DECLINED (or REJECTED). */
export const workerAwardedDeclined: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'declinedHeadline',
  subline: 'declinedClosedSubline',
  facts: ['preferredTime', 'location', 'categories', 'postedBy', 'description'],
  primaryAction: 'browseTasks',
}
