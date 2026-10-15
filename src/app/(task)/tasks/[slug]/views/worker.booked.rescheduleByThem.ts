import type { TaskDetailViewConfig } from './types'

/** The owner asked to move the booking (RESCHEDULING). */
export const workerBookedRescheduleByThem: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'rescheduleByThemHeadline',
  subline: 'rescheduleByThemSubline',
  facts: [
    'request',
    'bookedTime',
    'otherParty',
    'agreedPrice',
    'location',
    'description',
  ],
  primaryAction: 'message',
}
