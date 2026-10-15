import type { TaskDetailViewConfig } from './types'

/** CONFLICT: the owner marked it Failed, the worker marked it Done. */
export const ownerConflictIMarkedFailed: TaskDetailViewConfig = {
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
