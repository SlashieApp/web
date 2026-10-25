import { formatMessage } from '@/i18n/loadPageI11n'

import type { TaskSummaryCopy, TaskSummaryCopyKey } from './types'

export type TaskSummaryBudgetType = 'fixed' | 'hourly' | 'daily' | 'none'

export type TaskSummaryCopyParams = {
  /** Live (PENDING) quotes. */
  count: number
  budgetType: TaskSummaryBudgetType
  /** Formatted budget, e.g. "£120". */
  amount: string
  /** The other person on the booking. */
  name: string
  /** The booking's auto-Done date. */
  date: string
}

/** Which earn headline a budget gets. No amount reads as no budget. */
export function summaryBudgetType(
  budgetType: string | null | undefined,
  amount: string,
): TaskSummaryBudgetType {
  if (!amount) return 'none'
  const type = budgetType?.trim().toUpperCase().replaceAll(' ', '_')
  if (type === 'PER_HOUR') return 'hourly'
  if (type === 'PER_DAY') return 'daily'
  return 'fixed'
}

/**
 * Sub-lines that promise the auto-Done date, which waits while the task or
 * booking is frozen (BE-108). Their stand-ins say the same without it.
 */
const FROZEN_SUBLINES: Partial<Record<TaskSummaryCopyKey, TaskSummaryCopyKey>> =
  {
    iMarkedDoneSubline: 'iMarkedDoneFrozenSubline',
    theyMarkedDoneSubline: 'theyMarkedDoneFrozenSubline',
  }

/**
 * A view's sub-line while the task or booking is frozen: without the
 * auto-Done date. Every other sub-line is unchanged. The same swap as the
 * Expo app's `frozenSubline`.
 */
export function frozenSubline(
  ref: TaskSummaryCopy | null,
): TaskSummaryCopy | null {
  return typeof ref === 'string' ? (FROZEN_SUBLINES[ref] ?? ref) : ref
}

/**
 * Sub-lines that send the owner to Post the task again, which isn't the main
 * button when the API lets them reopen it (`Task.canReopen`, BE-113): Reopen
 * task is, so the line says that. Their stand-ins read the same otherwise.
 * `bookingFailedOwnerSubline` isn't here yet: its reopen copy is undecided.
 */
const REOPEN_SUBLINES: Partial<Record<TaskSummaryCopyKey, TaskSummaryCopyKey>> =
  {
    bookingCancelledOwnerSubline: 'bookingCancelledOwnerReopenSubline',
  }

/**
 * A view's sub-line for an owner who can reopen the task (`canReopen`): the
 * one that points at Reopen task, not at Repost. Every other sub-line, and
 * one for an owner who can't reopen, is unchanged. The same swap as the Expo
 * app's `reopenSubline`.
 */
export function reopenSubline(
  ref: TaskSummaryCopy | null,
  canReopen: boolean,
): TaskSummaryCopy | null {
  return canReopen && typeof ref === 'string'
    ? (REOPEN_SUBLINES[ref] ?? ref)
    : ref
}

/** A view's headline or sub-line as text, with its values filled in. */
export function resolveSummaryCopy(
  ref: TaskSummaryCopy | null,
  params: TaskSummaryCopyParams,
  copy: Record<TaskSummaryCopyKey, string>,
): string | null {
  if (!ref) return null
  let key: TaskSummaryCopyKey
  if (typeof ref === 'string') key = ref
  else if ('byCount' in ref) {
    const { zero, one, other } = ref.byCount
    key = params.count === 0 ? zero : params.count === 1 ? one : other
  } else key = ref.byBudget[params.budgetType]
  const { budgetType: _, ...values } = params
  return formatMessage(copy[key], values)
}
