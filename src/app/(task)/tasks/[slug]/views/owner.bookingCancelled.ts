import type { TaskDetailViewConfig } from './types'

/** Owner, booking CANCELLED (a cancel request was accepted). */
export const ownerBookingCancelled: TaskDetailViewConfig = {
  pill: 'CANCELLED',
  headline: 'bookingCancelledHeadline',
  subline: 'bookingCancelledOwnerSubline',
  facts: ['record', 'otherParty', 'agreedPrice'],
  primaryAction: 'repost',
}
