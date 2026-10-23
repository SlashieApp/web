import type { TaskDetailPrimaryAction } from '../views/types'
import { isCancelledTaskStatus } from './mapTaskStatus'

/**
 * Suspensions on task detail (BE-108). A suspended task, or a booking whose
 * other party's account is suspended, is frozen: nothing on it can change
 * until ops lift the suspension, which restores it as it was. These helpers
 * decide what the viewer may still do; the notice above the summary is a
 * named view (`views/getTaskNoticeView`).
 */

/** What the owner can reopen: a booking with a suspended worker, or a cancelled task. */
export type TaskReopenKind = 'booking' | 'cancelled'

/**
 * What the owner can reopen (`reopenTask`), or null. A booking whose worker
 * is suspended when the API says so (`canReopen`: a live booking on a task
 * that isn't suspended), else a cancelled task that isn't suspended.
 */
export function taskReopenKind(input: {
  isOwner: boolean
  taskStatus: string | null | undefined
  /** `Task.suspension`. */
  suspension:
    | { bySlashie: boolean; posterSuspended: boolean }
    | null
    | undefined
  /** The viewer's current booking. */
  order: { counterpartySuspension?: { canReopen: boolean } | null } | null
}): TaskReopenKind | null {
  if (!input.isOwner || input.suspension) return null
  if (input.order?.counterpartySuspension?.canReopen) return 'booking'
  return isCancelledTaskStatus(input.taskStatus) ? 'cancelled' : null
}

/**
 * The view's primary action, or null when the suspension would refuse it.
 * A suspended task takes no quotes and can't be reopened; a frozen booking
 * can't be marked Done or reviewed. Messages, the preview, Repost (a new
 * task), browsing and a receipt still work.
 */
export function availablePrimaryAction(
  action: TaskDetailPrimaryAction | null,
  state: {
    isSuspended: boolean
    isFrozen: boolean
    /** A review already sent turns Review into Get receipt. */
    viewerHasSubmittedReview: boolean
  },
): TaskDetailPrimaryAction | null {
  switch (action) {
    case 'sendQuote':
    case 'editQuote':
    case 'reopen':
      return state.isSuspended ? null : action
    case 'markDone':
      return state.isFrozen ? null : action
    case 'review':
      return state.isFrozen && !state.viewerHasSubmittedReview ? null : action
    default:
      return action
  }
}
