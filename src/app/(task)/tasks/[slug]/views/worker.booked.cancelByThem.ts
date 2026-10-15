import type { TaskDetailViewConfig } from './types'

/** The owner asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). */
export const workerBookedCancelByThem: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'cancelByThemHeadline',
  subline: 'cancelByThemSubline',
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
