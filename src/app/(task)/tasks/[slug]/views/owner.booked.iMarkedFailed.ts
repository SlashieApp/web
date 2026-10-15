import type { TaskDetailViewConfig } from './types'

/** Owner marked it Failed; waiting for the worker. */
export const ownerBookedIMarkedFailed: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'iMarkedFailedHeadline',
  subline: 'iMarkedFailedSubline',
  facts: [
    'otherParty',
    'agreedPrice',
    'bookedTime',
    'description',
    'photos',
    'closeSwitch',
  ],
  primaryAction: 'message',
}
