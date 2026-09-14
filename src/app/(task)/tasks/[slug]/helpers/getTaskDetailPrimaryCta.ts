import type { TaskDetailPermissions } from './getTaskDetailPermissions'

export type TaskDetailPrimaryCtaKind =
  | 'sendQuote'
  | 'signInToQuote'
  | 'viewQuotes'
  | 'share'
  | 'complete'
  | 'confirm'
  | 'none'

export type TaskDetailPrimaryCtaInput = {
  permissions: TaskDetailPermissions
  quoteCount: number
}

/**
 * Single most important action for the viewer's relationship to the task.
 * Uses existing permission flags only — no new eligibility rules.
 */
export function getTaskDetailPrimaryCta(
  input: TaskDetailPrimaryCtaInput,
): TaskDetailPrimaryCtaKind {
  const { permissions: p, quoteCount } = input

  if (p.showCompleteWithCode) return 'complete'
  if (p.showCustomerCompletionCode) return 'confirm'
  if (p.isOwner && p.isOpen && quoteCount > 0) return 'viewQuotes'
  if (p.showQuoteForm) return 'sendQuote'
  if (p.showGuestQuoteCta) return 'signInToQuote'
  if (p.isOwner && p.isOpen) return 'share'
  return 'none'
}
