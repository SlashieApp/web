import type { TaskDetailViewConfig } from './types'

/** Booked worker, booking ACTIVE, before the booked start. */
export const workerBookedBeforeStart: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'workerBookedHeadline',
  subline: 'workerBookedSubline',
  facts: [
    'bookedTime',
    'otherParty',
    'agreedPrice',
    'location',
    'description',
    'photos',
  ],
  actions: ['reschedule', 'cancelBooking'],
  primaryAction: 'message',
}
