import type { TaskDetailViewConfig } from './types'

/** Worker, task OPEN, their quote was DECLINED (or REJECTED): they can send a new one. */
export const workerOpenDeclined: TaskDetailViewConfig = {
  pill: 'OPEN',
  headline: 'declinedHeadline',
  subline: 'declinedOpenSubline',
  facts: [
    'budget',
    'preferredTime',
    'location',
    'categories',
    'postedBy',
    'description',
  ],
  primaryAction: 'sendQuote',
}
