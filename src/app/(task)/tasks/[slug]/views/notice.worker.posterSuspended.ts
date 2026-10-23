import type { TaskNoticeConfig } from './types'

/** Quoting worker (no booking) whose poster is suspended: their quote is on hold. */
export const noticeWorkerPosterSuspended: TaskNoticeConfig = {
  title: 'accountSuspendedTitle',
  body: 'quoteOnHoldBody',
  action: null,
}
