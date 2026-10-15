import type { TaskDetailViewConfig } from './types'

/** Booked worker marked it Failed; waiting for the owner. */
export const workerBookedIMarkedFailed: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'iMarkedFailedHeadline',
  subline: 'iMarkedFailedSubline',
  facts: ['otherParty', 'agreedPrice', 'bookedTime', 'description', 'photos'],
  actions: ['switchToDone'],
  primaryAction: 'message',
}
