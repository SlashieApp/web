import type { TaskDetailViewConfig } from './types'

/** The owner marked it Failed; waiting for the booked worker. */
export const workerBookedTheyMarkedFailed: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'theyMarkedFailedHeadline',
  subline: 'theyMarkedFailedSubline',
  facts: ['otherParty', 'agreedPrice', 'bookedTime', 'description', 'photos'],
  primaryAction: 'markDone',
}
