import type { TaskDetailViewConfig } from './types'

/** Anyone not on the booking (guest, customer, worker without a live quote) on a task whose job is complete. */
export const visitorCompleted: TaskDetailViewConfig = {
  pill: 'COMPLETED',
  headline: 'taskCompletedHeadline',
  subline: 'taskCompletedSubline',
  facts: ['location', 'categories', 'postedBy', 'description', 'photos'],
  primaryAction: null,
}
