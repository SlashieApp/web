import type { TaskDetailViewConfig } from './types'

/** Owner, task OPEN, no pending quotes yet. */
export const ownerOpenNoQuotes: TaskDetailViewConfig = {
  pill: 'OPEN',
  headline: 'ownerLiveHeadline',
  subline: 'ownerLiveSubline',
  facts: [
    'budget',
    'preferredTime',
    'location',
    'categories',
    'description',
    'photos',
  ],
  primaryAction: 'preview',
}
