import type { TaskDetailViewConfig } from './types'

/** The owner marked it Done; waiting for the booked worker. */
export const workerBookedTheyMarkedDone: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'theyMarkedDoneHeadline',
  subline: 'theyMarkedDoneSubline',
  facts: ['otherParty', 'agreedPrice', 'bookedTime', 'description', 'photos'],
  primaryAction: 'markDone',
}
