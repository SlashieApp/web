import type { TaskDetailViewConfig } from './types'

/** Booked worker, booking CANCELLED because both sides marked it Failed. */
export const workerBookingFailed: TaskDetailViewConfig = {
  pill: 'CANCELLED',
  headline: 'bookingFailedHeadline',
  subline: 'bookingFailedWorkerSubline',
  facts: ['record', 'otherParty', 'agreedPrice'],
  primaryAction: 'browseTasks',
}
