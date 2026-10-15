import type { TaskDetailViewConfig } from './types'

/** Signed in without a worker profile, task OPEN. */
export const customerOpen: TaskDetailViewConfig = {
  pill: 'OPEN',
  headline: {
    byBudget: {
      fixed: 'earnHeadline',
      hourly: 'earnHourlyHeadline',
      daily: 'earnDailyHeadline',
      none: 'openQuotesHeadline',
    },
  },
  subline: 'customerSubline',
  facts: [
    'payment',
    'preferredTime',
    'location',
    'categories',
    'postedBy',
    'description',
    'photos',
  ],
  primaryAction: 'becomeWorker',
}
