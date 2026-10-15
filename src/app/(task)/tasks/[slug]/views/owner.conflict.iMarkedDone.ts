import type { TaskDetailViewConfig } from './types'

/** CONFLICT: the owner marked it Done, the worker marked it Failed. */
export const ownerConflictIMarkedDone: TaskDetailViewConfig = {
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
