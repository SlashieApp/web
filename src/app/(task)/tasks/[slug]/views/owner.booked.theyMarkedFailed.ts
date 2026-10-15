import type { TaskDetailViewConfig } from './types'

/** The worker marked it Failed; waiting for the owner. */
export const ownerBookedTheyMarkedFailed: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'theyMarkedFailedHeadline',
  subline: 'theyMarkedFailedSubline',
  facts: ['otherParty', 'agreedPrice', 'bookedTime', 'description'],
  primaryAction: 'markDone',
}
