import { TaskTimelineEventType } from '@codegen/schema'

import {
  isHubCompletedTaskStatus,
  isHubDoneOrderStatus,
  normHubStatus,
} from '@/app/(task)/tasks/helpers/myTasksHub'

import type { AppLocale } from '@/i18n/locales'

/**
 * Order terminal status after BE-58 (`CLOSED` → `COMPLETED`).
 * Codegen may still only expose `CLOSED`. Compare this string; do not
 * also treat `CLOSED` as a parallel completed status.
 */
export const ORDER_STATUS_COMPLETED = 'COMPLETED'

const DATE_LOCALE: Record<AppLocale, string> = {
  en: 'en-GB',
  'zh-hk': 'zh-HK',
}

export type TaskDetailCompletedOrder = {
  status: string
  closedAt?: unknown
  workCompletedAt?: unknown
  workerPaymentAcknowledgedAt?: unknown
}

export type TaskDetailCompletedTimelineEvent = {
  type: string
  timestamp?: unknown
}

export function isOrderCompletedStatus(
  status: string | null | undefined,
): boolean {
  if (!status) return false
  return normHubStatus(status) === ORDER_STATUS_COMPLETED
}

/**
 * Completed chrome on task detail.
 *
 * Matches the My Tasks hub Completed section for:
 * - an order in the hub done-order set (`COMPLETED`, and the in-flight
 *   done statuses the hub already files there)
 * - a task in the hub terminal set (`COMPLETED`, `CONFIRMED`)
 *
 * `CANCELLED` stays on the cancelled chrome even though the hub lists it
 * in the Completed section.
 */
export function isTaskDetailJobCompleted(input: {
  taskStatus: string | null | undefined
  orderStatus: string | null | undefined
}): boolean {
  const taskStatus = normHubStatus(input.taskStatus ?? '')
  if (taskStatus === 'CANCELLED') return false
  if (isHubDoneOrderStatus(input.orderStatus)) return true
  return taskStatus === 'COMPLETED' || taskStatus === 'CONFIRMED'
}

function timestampOf(
  timeline: readonly TaskDetailCompletedTimelineEvent[] | null | undefined,
  type: string,
): unknown | null {
  const match = timeline?.find((event) => event.type === type)
  return match?.timestamp ?? null
}

function present(value: unknown): unknown | null {
  if (value == null || value === '') return null
  return value
}

/**
 * When the completed badge should show a date.
 * `COMPLETED` orders use `closedAt` only. With no order, the date comes
 * from the task timeline (`TASK_COMPLETED`, then `TASK_CONFIRMED`) — the
 * same terminal moments the hub Completed section uses.
 */
export function taskDetailCompletedAt(input: {
  taskStatus: string | null | undefined
  order: TaskDetailCompletedOrder | null
  timeline?: readonly TaskDetailCompletedTimelineEvent[] | null
}): unknown | null {
  if (
    !isTaskDetailJobCompleted({
      taskStatus: input.taskStatus,
      orderStatus: input.order?.status ?? null,
    })
  ) {
    return null
  }

  const order = input.order
  const orderStatus = order ? normHubStatus(order.status) : null

  if (orderStatus === ORDER_STATUS_COMPLETED) {
    return present(order?.closedAt)
  }

  if (!order) {
    return (
      present(
        timestampOf(input.timeline, TaskTimelineEventType.TaskCompleted),
      ) ??
      present(timestampOf(input.timeline, TaskTimelineEventType.TaskConfirmed))
    )
  }

  if (orderStatus === 'WORK_COMPLETED') {
    return present(order.workCompletedAt)
  }

  if (orderStatus === 'PAYMENT_ACKNOWLEDGED') {
    return (
      present(order.workerPaymentAcknowledgedAt) ??
      present(order.workCompletedAt)
    )
  }

  if (isHubCompletedTaskStatus(input.taskStatus)) {
    return (
      present(
        timestampOf(input.timeline, TaskTimelineEventType.TaskCompleted),
      ) ??
      present(
        timestampOf(input.timeline, TaskTimelineEventType.TaskConfirmed),
      ) ??
      present(order.closedAt)
    )
  }

  return null
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
