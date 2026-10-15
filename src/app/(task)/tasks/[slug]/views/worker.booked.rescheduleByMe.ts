import type { TaskDetailViewConfig } from './types'

/** Booked worker asked to move the booking (RESCHEDULING). */
export const workerBookedRescheduleByMe: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'rescheduleByMeHeadline',
  subline: 'rescheduleByMeSubline',
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
