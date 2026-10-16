import { TaskStatus } from '@codegen/schema'

import type { EditTaskViewInput, EditTaskViewName } from './types'

/**
 * The one place that decides what /tasks/[slug]/edit shows. Precedence:
 * session, the query, no task, not the poster, then the task's status.
 */
export function getEditTaskView({
  session,
  query,
  task,
}: EditTaskViewInput): EditTaskViewName {
  if (session === 'guest') return 'edit.signIn'
  if (session === 'loading' || query === 'loading') return 'edit.loading'
  if (query === 'error') return 'edit.loadError'
  if (!task) return 'edit.notFound'
  if (!task.isOwner) return 'edit.notOwner'
  if (task.status === TaskStatus.Awarded) return 'edit.booked'
  if (task.status === TaskStatus.Cancelled) return 'edit.cancelled'
  return task.liveQuotes > 0 ? 'edit.openWithQuotes' : 'edit.open'
}
