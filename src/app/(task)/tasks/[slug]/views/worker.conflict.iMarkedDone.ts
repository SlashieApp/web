import type { TaskDetailViewConfig } from './types'

/** CONFLICT: the booked worker marked it Done, the owner marked it Failed. */
export const workerConflictIMarkedDone: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'conflictHeadline',
  subline: 'conflictIMarkedDoneSubline',
  facts: [
    'otherParty',
    'agreedPrice',
    'bookedTime',
    'conflictActions',
    'description',
  ],
  primaryAction: 'message',
}
