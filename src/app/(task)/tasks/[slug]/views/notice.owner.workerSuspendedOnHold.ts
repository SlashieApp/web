import type { TaskNoticeConfig } from './types'

/**
 * Customer whose booked worker is suspended while the API doesn't let them
 * reopen (`canReopen` false): the booking is on hold, as the worker's side reads.
 */
export const noticeOwnerWorkerSuspendedOnHold: TaskNoticeConfig = {
  title: 'accountSuspendedTitle',
  body: 'bookingOnHoldBody',
  action: null,
}
