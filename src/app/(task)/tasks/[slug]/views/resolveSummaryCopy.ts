import { TaskBudgetUnit } from '@codegen/schema'

import {
  type TaskBudgetLike,
  hasTaskBudget,
  taskBudgetCustomUnit,
  taskBudgetUnit,
} from '@/app/(task)/helpers/taskBudget/taskBudget'
import { formatMessage } from '@/i18n/loadPageI11n'

import type { TaskSummaryCopy, TaskSummaryCopyKey } from './types'

export type TaskSummaryBudgetType =
  | 'fixed'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'visit'
  | 'item'
  | 'custom'
  | 'none'

export type TaskSummaryCopyParams = {
  /** Live (PENDING) quotes. */
  count: number
  budgetType: TaskSummaryBudgetType
  /** Formatted budget, e.g. "£120". */
  amount: string
  /** The poster's own unit, e.g. "per room" (`custom` only). */
  unit: string
  /** The other person on the booking. */
  name: string
  /** The booking's auto-Done date. */
  date: string
}

const BUDGET_TYPE_BY_UNIT: Record<TaskBudgetUnit, TaskSummaryBudgetType> = {
  [TaskBudgetUnit.Total]: 'fixed',
  [TaskBudgetUnit.PerHour]: 'hourly',
  [TaskBudgetUnit.PerDay]: 'daily',
  [TaskBudgetUnit.PerWeek]: 'weekly',
  [TaskBudgetUnit.PerVisit]: 'visit',
  [TaskBudgetUnit.PerItem]: 'item',
  [TaskBudgetUnit.Custom]: 'custom',
}

/**
 * Which earn headline a budget gets, by its unit (FE-584). No budget (an
 * open budget) reads as none; a custom unit with no words, as the whole job.
 */
export function summaryBudgetType(
  budget: TaskBudgetLike,
): TaskSummaryBudgetType {
  if (!hasTaskBudget(budget)) return 'none'
  const type = BUDGET_TYPE_BY_UNIT[taskBudgetUnit(budget)]
  if (type === 'custom' && !taskBudgetCustomUnit(budget)) return 'fixed'
  return type
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
 */
const REOPEN_SUBLINES: Partial<Record<TaskSummaryCopyKey, TaskSummaryCopyKey>> =
  {
    bookingCancelledOwnerSubline: 'bookingCancelledOwnerReopenSubline',
    bookingFailedOwnerSubline: 'bookingFailedOwnerReopenSubline',
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
