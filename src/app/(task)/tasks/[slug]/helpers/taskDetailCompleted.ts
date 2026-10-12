import { normHubStatus } from '@/app/(task)/tasks/helpers/myTasksHub'

import type { AppLocale } from '@/i18n/locales'

/** The only successful terminal order status (mutual Done or 7-day auto-Done). */
export const ORDER_STATUS_COMPLETED = 'COMPLETED'

const DATE_LOCALE: Record<AppLocale, string> = {
  en: 'en-GB',
  'zh-hk': 'zh-HK',
}

export type TaskDetailCompletedOrder = {
  status: string
  closedAt?: unknown
}

export function isOrderCompletedStatus(
  status: string | null | undefined,
): boolean {
  if (!status) return false
  return normHubStatus(status) === ORDER_STATUS_COMPLETED
}

/**
 * Completed chrome on task detail: the viewer's order is COMPLETED. A
 * finished job keeps its task AWARDED, so only the order decides. A
 * cancelled task stays on the cancelled chrome.
 */
export function isTaskDetailJobCompleted(input: {
  taskStatus: string | null | undefined
  orderStatus: string | null | undefined
}): boolean {
  if (normHubStatus(input.taskStatus ?? '') === 'CANCELLED') return false
  return isOrderCompletedStatus(input.orderStatus)
}

/** When the completed badge should show a date: the order's `closedAt`. */
export function taskDetailCompletedAt(input: {
  taskStatus: string | null | undefined
  order: TaskDetailCompletedOrder | null
}): unknown | null {
  if (
    !isTaskDetailJobCompleted({
      taskStatus: input.taskStatus,
      orderStatus: input.order?.status ?? null,
    })
  ) {
    return null
  }
  const closedAt = input.order?.closedAt
  return closedAt == null || closedAt === '' ? null : closedAt
}

export function formatTaskDetailCompletedDate(
  value: unknown,
  locale: AppLocale,
): string | null {
  const date =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value instanceof Date
        ? value
        : null
  if (!date || Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    dateStyle: 'medium',
  }).format(date)
}
