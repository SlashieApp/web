import type { TaskDetailViewConfig } from './types'

/** CONFLICT: the booked worker marked it Failed, the owner marked it Done. */
export const workerConflictIMarkedFailed: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'conflictHeadline',
  subline: 'conflictIMarkedFailedSubline',
  facts: [
    'otherParty',
    'agreedPrice',
    'bookedTime',
    'conflictActions',
    'description',
  ],
  primaryAction: 'message',
}
