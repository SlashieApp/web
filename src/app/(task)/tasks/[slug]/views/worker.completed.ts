import type { TaskDetailViewConfig } from './types'

/** Booked worker, booking COMPLETED. */
export const workerCompleted: TaskDetailViewConfig = {
  pill: 'COMPLETED',
  headline: 'completedHeadline',
  subline: 'completedSubline',
  facts: [
    'record',
    'otherParty',
    'agreedPrice',
    'bookedTime',
    'reviews',
    'description',
  ],
  primaryAction: 'review',
}
