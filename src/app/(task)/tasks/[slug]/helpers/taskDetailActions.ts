import { TASK_DETAIL_VIEWS } from '../views'
import type { TaskDetailAction, TaskDetailViewName } from '../views/types'
import type { TaskDetailPermissions } from './getTaskDetailPermissions'

/**
 * The view's actions that Help & actions offers now. Booking actions need a
 * live booking that isn't frozen (BE-108), but reporting the other person
 * stays. Withdraw quote follows the API (`canWithdrawQuote`): a pending quote
 * can go once someone else is booked or the booking ended (BE-116), and the
 * owner isn't told.
 */
export function availableActions(
  view: TaskDetailViewName,
  permissions: Pick<
    TaskDetailPermissions,
    'showOrderActions' | 'canWithdrawQuote'
  >,
): TaskDetailAction[] {
  return (TASK_DETAIL_VIEWS[view].actions ?? []).filter((action) => {
    if (action === 'withdrawQuote') return permissions.canWithdrawQuote
    return permissions.showOrderActions || action === 'reportOtherParty'
  })
}
