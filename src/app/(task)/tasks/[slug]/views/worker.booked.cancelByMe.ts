import type { TaskDetailViewConfig } from './types'

/** Booked worker asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). */
export const workerBookedCancelByMe: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'cancelByMeHeadline',
  subline: 'cancelByMeSubline',
  facts: [
    'request',
    'bookedTime',
    'otherParty',
    'agreedPrice',
    'location',
    'description',
    'photos',
  ],
  actions: ['withdrawRequest'],
  primaryAction: 'message',
}
