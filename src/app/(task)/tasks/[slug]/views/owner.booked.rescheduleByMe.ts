import type { TaskDetailViewConfig } from './types'

/** Owner asked to move the booking (RESCHEDULING). */
export const ownerBookedRescheduleByMe: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'rescheduleByMeHeadline',
  subline: 'rescheduleByMeSubline',
  facts: [
    'request',
    'bookedTime',
    'otherParty',
    'agreedPrice',
    'description',
    'photos',
  ],
  actions: ['withdrawRequest'],
  primaryAction: 'message',
}
