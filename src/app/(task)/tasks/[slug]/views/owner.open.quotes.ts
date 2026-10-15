import type { TaskDetailViewConfig } from './types'

/** Owner, task OPEN, one or more pending (live) quotes. */
export const ownerOpenQuotes: TaskDetailViewConfig = {
  pill: 'OPEN',
  headline: {
    byCount: {
      zero: 'ownerQuotesHeadlineMany',
      one: 'ownerQuotesHeadlineOne',
      other: 'ownerQuotesHeadlineMany',
    },
  },
  subline: 'ownerQuotesSubline',
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
