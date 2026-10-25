import { ThreadKind } from '@codegen/schema'

import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'

import type { ThreadViewInput, ThreadViewName } from './types'

/**
 * Whether the viewer's still-pending quote lost the task to someone else's
 * booking (BE-113), from task detail's view: booked, completed, or neither.
 */
export function threadOtherBooking(
  view: TaskDetailViewName,
): ThreadViewInput['otherBooking'] {
  if (view === 'worker.bookedByOther') return 'booked'
  if (view === 'worker.completedByOther') return 'completed'
  return null
}

/**
 * The one place that decides what the open conversation shows. Precedence:
 * nothing picked, the query, Slashie threads, then why you can or can't send
 * (a suspension says messaging is paused, never "once a quote is accepted",
 * and a task someone else booked says so, never that either).
 */
export function getThreadView({
  threadId,
  query,
  thread,
  suspended,
  otherBooking,
}: ThreadViewInput): ThreadViewName {
  if (!threadId) return 'thread.none'
  if (query === 'loading') return 'thread.loading'
  if (query === 'error') return 'thread.loadError'
  if (query === 'notFound' || !thread) return 'thread.notFound'
  if (thread.kind === ThreadKind.System) return 'thread.system'
  if (thread.canSend) return 'thread.open'
  if (thread.blockedByMe) return 'thread.blocked'
  if (suspended) return 'thread.suspended'
  if (otherBooking === 'booked') return 'thread.bookedByOther'
  if (otherBooking === 'completed') return 'thread.completedByOther'
  return 'thread.locked'
}
