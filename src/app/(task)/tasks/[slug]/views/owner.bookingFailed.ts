import type { TaskDetailViewConfig } from './types'

/** Owner, booking CANCELLED because both sides marked it Failed. */
export const ownerBookingFailed: TaskDetailViewConfig = {
  pill: 'CANCELLED',
  headline: 'bookingFailedHeadline',
  subline: 'bookingFailedOwnerSubline',
  facts: ['record', 'otherParty', 'agreedPrice'],
  primaryAction: 'repost',
}
