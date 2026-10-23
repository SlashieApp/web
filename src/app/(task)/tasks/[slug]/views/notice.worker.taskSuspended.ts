import type { TaskNoticeConfig } from './types'

/** Booked or quoting worker on a task Slashie suspended: their quote and booking are on hold. */
export const noticeWorkerTaskSuspended: TaskNoticeConfig = {
  title: 'taskSuspendedTitle',
  body: 'workerTaskSuspendedBody',
  action: null,
}
