import type { TaskDetailViewConfig } from './types'

/** Owner, task CANCELLED. */
export const ownerCancelled: TaskDetailViewConfig = {
  pill: 'CANCELLED',
  headline: 'cancelledHeadline',
  subline: 'cancelledOwnerSubline',
  facts: [
    'budget',
    'preferredTime',
    'location',
    'categories',
    'description',
    'photos',
  ],
  primaryAction: 'repost',
}
