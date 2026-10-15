import type { TaskDetailViewConfig } from './types'

/** The worker marked it Done; waiting for the owner. */
export const ownerBookedTheyMarkedDone: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'theyMarkedDoneHeadline',
  subline: 'theyMarkedDoneSubline',
  facts: ['otherParty', 'agreedPrice', 'bookedTime', 'description'],
  primaryAction: 'markDone',
}
