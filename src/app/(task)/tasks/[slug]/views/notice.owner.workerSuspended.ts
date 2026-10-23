import type { TaskNoticeConfig } from './types'

/** Customer whose booked worker is suspended (`canReopen`): reopen to choose another quote. */
export const noticeOwnerWorkerSuspended: TaskNoticeConfig = {
  title: 'accountSuspendedTitle',
  body: 'bookingOnHoldReopenBody',
  action: 'reopen',
}
