import { OrderPartyRole, OrderStatus, QuoteStatus } from '@codegen/schema'

import type { TaskNoticeViewName } from './types'

/** `Task.suspension`: why the task is suspended; null when it isn't. */
export type TaskNoticeSuspension = {
  bySlashie: boolean
  posterSuspended: boolean
}

/** `Order.counterpartySuspension`: the other party on the booking is suspended. */
export type TaskNoticeCounterparty = {
  /** WORKER when the viewer is the customer, CUSTOMER when they are the worker. */
  role: OrderPartyRole | string
  name: string
  canReopen: boolean
}

export type TaskNoticeInput = {
  suspension: TaskNoticeSuspension | null | undefined
  /** The viewer's current booking (`currentTaskOrder`); null without one. */
  order: {
    status: string
    workerUserId: string
    counterpartySuspension?: TaskNoticeCounterparty | null
  } | null
  /**
   * Null for a signed-out guest. `quoteStatus`: the viewer's own quote on
   * the task, if they sent one.
   */
  viewer: {
    userId: string
    isOwner: boolean
    quoteStatus?: string | null
  } | null
}

/**
 * The notice above the summary, or null (BE-108, founder decisions and the
 * copy additions of 2026-10-23; the same rules as the Expo app). The owner
 * of a task Slashie suspended is told to contact support. On a booking that
 * is still on (booked or CONFLICT), the customer of a suspended worker can
 * reopen when the API allows it, else is told it is on hold, and the worker
 * of a suspended customer gets a notice only. Workers on a task Slashie
 * suspended (booked, or with a pending quote) are told their quote and
 * booking are on hold, which wins over the poster's suspension; a quoting
 * worker whose poster is suspended is told their quote is on hold. A booking
 * that has finished, anyone else, and an owner whose own account is
 * suspended (the app-wide banner says so) get none.
 */
export function getTaskNoticeView({
  suspension,
  order,
  viewer,
}: TaskNoticeInput): TaskNoticeViewName | null {
  if (!viewer) return null
  if (viewer.isOwner && suspension?.bySlashie) {
    return 'notice.owner.taskSuspended'
  }
  const live = Boolean(
    order &&
      order.status !== OrderStatus.Completed &&
      order.status !== OrderStatus.Cancelled,
  )
  const other = order?.counterpartySuspension
  if (viewer.isOwner) {
    if (!live || other?.role !== OrderPartyRole.Worker) return null
    return other.canReopen
      ? 'notice.owner.workerSuspended'
      : 'notice.owner.workerSuspendedOnHold'
  }

  const booked = live && order?.workerUserId === viewer.userId
  const quoting = viewer.quoteStatus === QuoteStatus.Pending
  if (!booked && !quoting) return null
  if (suspension?.bySlashie) return 'notice.worker.taskSuspended'
  if (booked) {
    // The poster's suspension reaches the booked worker on the task too.
    return other?.role === OrderPartyRole.Customer ||
      suspension?.posterSuspended
      ? 'notice.worker.customerSuspended'
      : null
  }
  return suspension?.posterSuspended ? 'notice.worker.posterSuspended' : null
}

/**
 * "{name}" in a notice: the suspended person as the API names them, else the
 * poster (the worker's customer), else `fallback`.
 */
export function taskNoticePersonName(
  order: { counterpartySuspension?: { name: string } | null } | null,
  posterName: string | null | undefined,
  fallback: string,
): string {
  return (
    order?.counterpartySuspension?.name?.trim() ||
    posterName?.trim() ||
    fallback
  )
}
