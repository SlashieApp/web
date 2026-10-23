import type { TaskDetailViewConfig } from './types'

/** Owner, task CANCELLED: it can be reopened for quotes (BE-108). */
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
  primaryAction: 'reopen',
}
