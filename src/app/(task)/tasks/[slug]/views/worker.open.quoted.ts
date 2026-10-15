import type { TaskDetailViewConfig } from './types'

/** Worker, task OPEN, their quote is PENDING. */
export const workerOpenQuoted: TaskDetailViewConfig = {
  pill: 'OPEN',
  headline: 'quoteSentHeadline',
  subline: 'quoteSentSubline',
  facts: [
    'myQuote',
    'preferredTime',
    'location',
    'categories',
    'postedBy',
    'description',
  ],
  primaryAction: 'editQuote',
}
