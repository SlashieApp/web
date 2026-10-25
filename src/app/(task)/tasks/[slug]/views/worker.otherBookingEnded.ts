import type { TaskDetailViewConfig } from './types'

/**
 * Worker whose quote is still PENDING after the task's booking was cancelled
 * or both sides marked it Failed (BE-113, BE-116). The task stays AWARDED
 * until the owner reopens it, so the quote may count again. Status only, as
 * `worker.bookedByOther`.
 */
export const workerOtherBookingEnded: TaskDetailViewConfig = {
  pill: 'CANCELLED',
  headline: 'bookingCancelledHeadline',
  subline: 'otherBookingEndedSubline',
  facts: [
    'myQuote',
    'location',
    'categories',
    'postedBy',
    'description',
    'photos',
  ],
  primaryAction: 'browseTasks',
  actions: ['withdrawQuote'],
}
