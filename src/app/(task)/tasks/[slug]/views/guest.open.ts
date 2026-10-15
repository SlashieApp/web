import type { TaskDetailViewConfig } from './types'

/** Signed out, task OPEN. */
export const guestOpen: TaskDetailViewConfig = {
  pill: 'OPEN',
  headline: {
    byBudget: {
      fixed: 'earnHeadline',
      hourly: 'earnHourlyHeadline',
      daily: 'earnDailyHeadline',
      none: 'openQuotesHeadline',
    },
  },
  subline: 'guestSubline',
  facts: [
    'payment',
    'preferredTime',
    'location',
    'categories',
    'postedBy',
    'description',
  ],
  primaryAction: 'signInToQuote',
}
