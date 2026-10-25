import type { TaskDetailViewConfig } from './types'

/**
 * Worker, task OPEN, their quote is CLOSED: the booking it won ended early
 * and the owner reopened the task (BE-113). It never comes back, but they
 * can send a new one.
 */
export const workerOpenClosed: TaskDetailViewConfig = {
  pill: 'OPEN',
  headline: 'quoteClosedHeadline',
  subline: 'quoteClosedSubline',
  facts: [
    'budget',
    'preferredTime',
    'location',
    'categories',
    'postedBy',
    'description',
    'photos',
  ],
  primaryAction: 'sendQuote',
}
