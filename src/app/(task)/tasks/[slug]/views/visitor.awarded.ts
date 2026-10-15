import type { TaskDetailViewConfig } from './types'

/** Anyone not on the booking (guest, customer, worker without a quote) on an AWARDED task. */
export const visitorAwarded: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'awardedHeadline',
  subline: 'awardedSubline',
  facts: ['location', 'categories', 'postedBy', 'description'],
  primaryAction: null,
}
