import type { TaskDetailViewConfig } from './types'

/** Owner asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). */
export const ownerBookedCancelByMe: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'cancelByMeHeadline',
  subline: 'cancelByMeSubline',
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
