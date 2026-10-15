import type { TaskDetailViewConfig } from './types'

/** Owner, booking ACTIVE, before the booked start. */
export const ownerBookedBeforeStart: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'ownerBookedHeadline',
  subline: 'ownerBookedSubline',
  facts: [
    'bookedTime',
    'otherParty',
    'agreedPrice',
    'description',
    'bookingActions',
  ],
  primaryAction: 'message',
}
