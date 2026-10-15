import type { TaskDetailViewConfig } from './types'

/** Worker (profile set up), task OPEN, no live quote from them (a withdrawn quote reads the same: they can quote again). */
export const workerOpenNotQuoted: TaskDetailViewConfig = {
  pill: 'OPEN',
  headline: {
    byCount: {
      zero: 'openQuotesHeadline',
      one: 'openQuotesCountHeadline',
      other: 'openQuotesCountHeadline',
    },
  },
  subline: 'openQuotesSubline',
  facts: [
    'budget',
    'preferredTime',
    'location',
    'categories',
    'postedBy',
    'description',
  ],
  primaryAction: 'sendQuote',
}
