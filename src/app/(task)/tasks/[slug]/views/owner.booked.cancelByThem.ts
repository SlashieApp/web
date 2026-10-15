import type { TaskDetailViewConfig } from './types'

/** The worker asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). */
export const ownerBookedCancelByThem: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'cancelByThemHeadline',
  subline: 'cancelByThemSubline',
  facts: ['request', 'bookedTime', 'otherParty', 'agreedPrice', 'description'],
  primaryAction: 'message',
}
