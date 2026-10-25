import type { TaskDetailViewConfig } from './types'

/**
 * Worker whose quote is still PENDING while someone else is booked (BE-113).
 * Status only: nobody tells them, and they never learn who.
 */
export const workerBookedByOther: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'bookedByOtherHeadline',
  subline: 'browseSubline',
  facts: [
    'myQuote',
    'location',
    'categories',
    'postedBy',
    'description',
    'photos',
  ],
  primaryAction: 'browseTasks',
}
