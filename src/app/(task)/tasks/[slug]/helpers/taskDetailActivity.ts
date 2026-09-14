import { OrderStatus } from '@codegen/schema'

import type { OrderItem } from '@/utils/orderHelpers'

import type { TaskDetailPermissions } from './getTaskDetailPermissions'
import type { TaskDetailRecord } from './taskDetailUtils'

export type TaskActivityStep = {
  key: string
  label: string
  detail?: string
  at?: string | null
  done: boolean
  current: boolean
}

export type TaskActivityCopy = {
  posted: string
  postedDetail: string
  quotesLabel: string
  quotesDetail?: string
  bookedLabel: string
  bookedActive: string
  completed: string
  cancelled: string
}

/**
 * Lifecycle strip for the Activity tab. Derived from existing task/order/quote
 * fields — not a new API. Mirrors the posted-task request timeline, localized.
 */
export function buildTaskActivitySteps(
  task: TaskDetailRecord,
  myOrder: OrderItem | null,
  permissions: TaskDetailPermissions,
  copy: TaskActivityCopy,
): TaskActivityStep[] {
  const quoteCount = task.quotes.length
  const createdAt =
    task.timeline?.find((e) => String(e.type) === 'TASK_CREATED')?.timestamp ??
    task.timeline?.[0]?.timestamp ??
    null

  const quotingDone =
    quoteCount > 0 || permissions.isAwarded || permissions.isClosed
  const bookedDone =
    permissions.isClosed ||
    Boolean(myOrder && myOrder.status !== OrderStatus.Cancelled)
  const doneDone = permissions.isClosed || permissions.isCancelled

  return [
    {
      key: 'posted',
      label: copy.posted,
      detail: copy.postedDetail,
      at: createdAt,
      done: true,
      current: permissions.isOpen && quoteCount === 0,
    },
    {
      key: 'quotes',
      label: copy.quotesLabel,
      detail: copy.quotesDetail,
      done: quotingDone,
      current: permissions.isOpen && quoteCount > 0,
    },
    {
      key: 'booked',
      label: copy.bookedLabel,
      detail:
        myOrder?.status === OrderStatus.Active ? copy.bookedActive : undefined,
      at: myOrder?.createdAt,
      done: bookedDone,
      current: permissions.isAwarded,
    },
    {
      key: 'done',
      label: permissions.isCancelled ? copy.cancelled : copy.completed,
      at: myOrder?.closedAt ?? myOrder?.workCompletedAt,
      done: doneDone,
      current: permissions.isClosed || permissions.isCancelled,
    },
  ]
}
