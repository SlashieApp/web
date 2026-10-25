import type { TaskDetailPrimaryAction } from '../views/types'

/**
 * Suspensions on task detail (BE-108). A suspended task, or a booking whose
 * other party's account is suspended, is frozen: nothing on it can change
 * until ops lift the suspension, which restores it as it was. These helpers
 * decide what the viewer may still do; the notice above the summary is a
 * named view (`views/getTaskNoticeView`).
 */

/**
 * The view's primary action, or null when the API would refuse it. A
 * suspended task takes no quotes; a frozen booking can't be marked Done or
 * reviewed. Messages, the preview, Repost (a new task), browsing and a
 * receipt still work.
 *
 * Reopen task is the API's call (`Task.canReopen`, BE-113), not the view's:
 * it shows only when the owner can reopen. A booking that ended early
 * (`owner.bookingCancelled`, `owner.bookingFailed`) offers Reopen task in
 * place of Repost then; Repost stays in Help & actions.
 */
export function availablePrimaryAction(
  action: TaskDetailPrimaryAction | null,
  state: {
    isSuspended: boolean
    isFrozen: boolean
    /** `permissions.canReopen`. */
    canReopen: boolean
    /** A review already sent turns Review into Get receipt. */
    viewerHasSubmittedReview: boolean
  },
): TaskDetailPrimaryAction | null {
  switch (action) {
    case 'sendQuote':
    case 'editQuote':
      return state.isSuspended ? null : action
    case 'reopen':
      return state.canReopen ? action : null
    case 'repost':
      return state.canReopen ? 'reopen' : action
    case 'markDone':
      return state.isFrozen ? null : action
    case 'review':
      return state.isFrozen && !state.viewerHasSubmittedReview ? null : action
    default:
      return action
  }
}
