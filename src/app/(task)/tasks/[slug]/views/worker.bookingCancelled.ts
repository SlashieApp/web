import type { TaskDetailViewConfig } from './types'

/** Booked worker, booking CANCELLED (a cancel request was accepted). */
export const workerBookingCancelled: TaskDetailViewConfig = {
  pill: 'CANCELLED',
  headline: 'bookingCancelledHeadline',
  subline: 'bookingCancelledWorkerSubline',
  facts: ['record', 'otherParty', 'agreedPrice'],
  primaryAction: 'browseTasks',
}
