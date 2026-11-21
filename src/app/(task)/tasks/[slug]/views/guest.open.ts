import type { TaskDetailViewConfig } from './types'

/** Signed out, task OPEN. */
export const guestOpen: TaskDetailViewConfig = {
  pill: 'OPEN',
  headline: {
    byBudget: {
      fixed: 'earnHeadline',
      hourly: 'earnHourlyHeadline',
      daily: 'earnDailyHeadline',
      weekly: 'earnWeeklyHeadline',
      visit: 'earnVisitHeadline',
      item: 'earnItemHeadline',
      custom: 'earnCustomHeadline',
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
    'photos',
  ],
  primaryAction: 'signInToQuote',
}
