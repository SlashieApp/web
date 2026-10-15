import type { TaskDetailViewConfig } from './types'

/** Booked worker marked it Done; waiting for the owner (auto-completes after 7 days). */
export const workerBookedIMarkedDone: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'iMarkedDoneHeadline',
  subline: 'iMarkedDoneSubline',
  facts: [
    'otherParty',
    'agreedPrice',
    'bookedTime',
    'description',
    'closeSwitch',
  ],
  primaryAction: 'message',
}
