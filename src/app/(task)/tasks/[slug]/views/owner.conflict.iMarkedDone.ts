import type { TaskDetailViewConfig } from './types'

/** CONFLICT: the owner marked it Done, the worker marked it Failed. */
export const ownerConflictIMarkedDone: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'conflictHeadline',
  subline: 'conflictIMarkedDoneSubline',
  facts: ['otherParty', 'agreedPrice', 'bookedTime', 'description', 'photos'],
  actions: ['askToCancel', 'reportOtherParty'],
  primaryAction: 'message',
}
