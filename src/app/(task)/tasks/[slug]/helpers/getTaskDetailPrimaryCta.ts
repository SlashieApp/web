import { workerSetupHref } from '@/app/(stepflow)/worker/setup/helpers/workerSetupHref'

import type { TaskDetailPermissions } from './getTaskDetailPermissions'

export type TaskDetailPrimaryCtaKind =
  | 'sendQuote'
  | 'editQuote'
  | 'becomeWorker'
  | 'viewQuotes'
  | 'preview'
  | 'workerBooked'
  | 'ownerBooked'
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

  if (p.showOrderActions && p.isOrderWorker) return 'workerBooked'
  if (p.showOrderActions && p.isOwner) return 'ownerBooked'
  if (p.isOwner && p.isOpen && quoteCount > 0) return 'viewQuotes'
  if (p.hasPendingQuote) return 'editQuote'
  if (p.showQuoteForm) return 'sendQuote'
  if (p.showBecomeWorkerCta) return 'becomeWorker'
  if (p.isOwner && p.isOpen) return 'preview'
  return 'none'
}

/**
 * Where a quote CTA goes. Become a worker returns to the task once setup is
 * done; guests sign up first (register carries `next` through to setup).
 */
export function taskQuoteCtaHref(
  kind: 'sendQuote' | 'becomeWorker',
  taskId: string,
  permissions: Pick<TaskDetailPermissions, 'showGuestQuoteCta'>,
): string {
  const taskPath = `/tasks/${taskId}`
  if (kind === 'sendQuote') return `${taskPath}/quote`
  const setup = workerSetupHref(taskPath)
  return permissions.showGuestQuoteCta
    ? `/register?next=${encodeURIComponent(setup)}`
    : setup
}
