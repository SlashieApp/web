import type { TaskDetailPermissions } from './getTaskDetailPermissions'
import type { TaskDetailTab } from './taskDetailTabs'

export type TaskDetailMobilePrimaryKind =
  | 'sendQuote'
  | 'viewQuotes'
  | 'completeJob'
  | 'share'
  | 'signIn'

export type TaskDetailMobilePrimary = {
  kind: TaskDetailMobilePrimaryKind
  href?: string
  tab?: TaskDetailTab
}

/**
 * Role-aware primary for the mobile action bar. Mirrors existing permission
 * gates — no new rules. Owner with zero quotes gets Share, not a dead
 * "View quotes".
 */
export function resolveTaskDetailMobilePrimary(input: {
  permissions: TaskDetailPermissions
  isAuthenticated: boolean
  quoteCount: number
  taskId: string
}): TaskDetailMobilePrimary {
  const { permissions, isAuthenticated, quoteCount, taskId } = input

  if (permissions.showCompleteWithCode) {
    return { kind: 'completeJob', tab: 'details' }
  }
  if (permissions.showQuoteForm) {
    return { kind: 'sendQuote', href: `/tasks/${taskId}/quote` }
  }
  if (permissions.isOwner && quoteCount > 0) {
    return { kind: 'viewQuotes', tab: 'quotes' }
  }
  if (!isAuthenticated) {
    return {
      kind: 'signIn',
      href: `/login?next=${encodeURIComponent(`/tasks/${taskId}`)}`,
    }
  }
  return { kind: 'share' }
}
