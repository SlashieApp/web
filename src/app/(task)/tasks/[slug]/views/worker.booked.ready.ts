import type { TaskDetailViewConfig } from './types'

/** Booked worker, start time passed, nobody has marked it yet. */
export const workerBookedReady: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'readyHeadline',
  subline: 'readySubline',
  facts: [
    'location',
    'otherParty',
    'agreedPrice',
    'bookedTime',
    'description',
    'photos',
  ],
  primaryAction: 'markDone',
}
