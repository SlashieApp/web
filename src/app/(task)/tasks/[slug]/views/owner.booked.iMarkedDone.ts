import type { TaskDetailViewConfig } from './types'

/** Owner marked it Done; waiting for the worker (auto-completes after 7 days). */
export const ownerBookedIMarkedDone: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'iMarkedDoneHeadline',
  subline: 'iMarkedDoneSubline',
  facts: ['otherParty', 'agreedPrice', 'bookedTime', 'description', 'photos'],
  actions: ['switchToFailed'],
  primaryAction: 'message',
}
