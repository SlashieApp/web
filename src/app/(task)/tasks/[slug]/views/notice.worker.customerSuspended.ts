import type { TaskNoticeConfig } from './types'

/** Booked worker whose customer is suspended: the booking is on hold; a notice only. */
export const noticeWorkerCustomerSuspended: TaskNoticeConfig = {
  title: 'accountSuspendedTitle',
  body: 'bookingOnHoldBody',
  action: null,
}
