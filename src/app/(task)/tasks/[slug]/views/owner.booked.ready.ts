import type { TaskDetailViewConfig } from './types'

/** Owner, booking ACTIVE, start time passed, nobody has marked it yet. */
export const ownerBookedReady: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'readyHeadline',
  subline: 'readySubline',
  facts: ['otherParty', 'agreedPrice', 'bookedTime', 'description'],
  primaryAction: 'markDone',
}
