import type { TaskDetailViewConfig } from './types'

/** Anyone except the owner on a CANCELLED task. */
export const visitorCancelled: TaskDetailViewConfig = {
  pill: 'CANCELLED',
  headline: 'cancelledHeadline',
  subline: 'cancelledVisitorSubline',
  facts: ['location', 'categories', 'postedBy', 'description'],
  primaryAction: null,
}
