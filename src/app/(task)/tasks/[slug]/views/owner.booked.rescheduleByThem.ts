import type { TaskDetailViewConfig } from './types'

/** The worker asked to move the booking (RESCHEDULING). */
export const ownerBookedRescheduleByThem: TaskDetailViewConfig = {
  pill: 'AWARDED',
  headline: 'rescheduleByThemHeadline',
  subline: 'rescheduleByThemSubline',
  facts: ['request', 'bookedTime', 'otherParty', 'agreedPrice', 'description'],
  primaryAction: 'message',
}
