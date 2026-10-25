import type { TaskDetailViewConfig } from './types'

/** Anyone not on the booking (guest, customer, worker without a live quote) on a task that is booked. */
export const visitorAwarded: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'awardedHeadline',
  subline: 'awardedSubline',
  facts: ['location', 'categories', 'postedBy', 'description', 'photos'],
  primaryAction: null,
}
