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
