import type { TaskDetailViewConfig } from './types'

/** Owner, booking COMPLETED (both marked Done, or the 7-day auto-Done). */
export const ownerCompleted: TaskDetailViewConfig = {
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
    'photos',
  ],
  primaryAction: 'review',
}
