import type { TaskNoticeConfig } from './types'

/** Owner of a task Slashie suspended: nobody can act on it; contact support. */
export const noticeOwnerTaskSuspended: TaskNoticeConfig = {
  title: 'taskSuspendedTitle',
  body: 'taskSuspendedBody',
  action: 'contactSupport',
}
